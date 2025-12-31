import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Loader2, Copy, Trash2 } from 'lucide-react';
import { getEntities } from '@/domain/entity/api/entityService';
import { createEntity, fetchRawEntity, deleteEntity } from '@/features/admin/api/adminService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import AdminForm from '@/features/admin/components/AdminForm';
import Button from '@/shared/components/ui/Button';

export default function SplitPaneManager() {
	const { type, id } = useParams();
	const navigate = useNavigate();
	const { campaignId } = useCampaign();
	const [search, setSearch] = useState('');

	// Action States
	const [isCloning, setIsCloning] = useState(null);
	const [isDeleting, setIsDeleting] = useState(null);

	const normalizedType = type === 'sessions' ? 'session' : type;

	// 1. Fetch List Data
	const {
		data: entities,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['admin-list', campaignId, normalizedType],
		queryFn: () => getEntities(campaignId, normalizedType),
		enabled: normalizedType === 'campaign' || !!campaignId,
	});

	const filtered = (entities || []).filter((item) =>
		(item.name || item.title || '').toLowerCase().includes(search.toLowerCase())
	);

	// --- ACTIONS ---

	const handleDuplicate = async (originalId, e) => {
		e.stopPropagation(); // Prevent navigation
		if (!confirm('Create a copy?')) return;

		setIsCloning(originalId);
		try {
			const raw = await fetchRawEntity(normalizedType, originalId);
			// Fix: Check for attributesList vs attributes object structure from fetchRawEntity
			// fetchRawEntity returns { ..., attributes: {...} } OR { ..., attributesList: [...] } depending on version
			// The service handles formatting for createEntity, we just need to modify the name.

			const copyData = {
				...raw,
				name: raw.name ? `${raw.name} (Copy)` : undefined,
				title: raw.title ? `${raw.title} (Copy)` : undefined,
				campaign_id: campaignId,
			};

			// If ID exists in raw data, remove it so DB creates new one
			delete copyData.id;

			const result = await createEntity(normalizedType, copyData);
			refetch(); // Refresh list
			navigate(`/dm/manage/${normalizedType}/${result.id}`);
		} catch (e) {
			alert('Failed to duplicate: ' + e.message);
		} finally {
			setIsCloning(false);
		}
	};

	const handleDelete = async (itemId, e) => {
		e.stopPropagation(); // Prevent navigation
		if (!confirm('Delete this entry?')) return;

		setIsDeleting(itemId);
		try {
			await deleteEntity(normalizedType, itemId);
			refetch();
			// If we deleted the currently selected item, go back to "Create New"
			if (id === itemId) {
				navigate(`/dm/manage/${normalizedType}`);
			}
		} catch (e) {
			alert('Delete failed: ' + e.message);
		} finally {
			setIsDeleting(null);
		}
	};

	return (
		<div className='flex h-[100vh] overflow-hidden bg-muted/10'>
			{/* --- LEFT PANE: LIST --- */}
			<div className='w-80 flex flex-col border-r border-border bg-background shrink-0 shadow-sm z-10'>
				{/* Header & Search */}
				<div className='p-3 border-b border-border space-y-3 bg-muted/10'>
					<div className='flex items-center justify-between'>
						<h2 className='text-lg font-serif font-bold capitalize text-foreground flex items-center gap-2'>
							{type}s
							<span className='text-xs font-sans font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border'>
								{entities?.length || 0}
							</span>
						</h2>
						<Button
							onClick={() => navigate(`/dm/manage/${normalizedType}`)}
							size='sm'
							variant='primary'
							icon={Plus}
							className='h-7 px-2 text-xs'>
							New
						</Button>
					</div>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2 text-muted-foreground/60' size={14} />
						<input
							type='text'
							placeholder='Filter list...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className='w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm'
						/>
					</div>
				</div>

				{/* Scrollable List */}
				<div className='flex-1 overflow-y-auto custom-scrollbar'>
					{isLoading ? (
						<div className='p-8 flex justify-center'>
							<Loader2 className='animate-spin text-amber-600' />
						</div>
					) : filtered.length === 0 ? (
						<div className='p-6 text-center text-xs text-muted-foreground italic'>No matches.</div>
					) : (
						<div className='divide-y divide-border/40'>
							{filtered.map((item) => {
								const isActive = id === item.id;
								return (
									<div
										key={item.id}
										onClick={() => navigate(`/dm/manage/${normalizedType}/${item.id}`)}
										className={`group relative flex items-center w-full text-left transition-all cursor-pointer ${
											isActive ? 'bg-amber-500/10/80' : 'bg-background hover:bg-muted/50'
										}`}>
										{/* Active Marker Strip */}
										<div
											className={`absolute left-0 top-0 bottom-0 w-1 ${isActive ? 'bg-amber-500/100' : 'bg-transparent'}`}
										/>

										{/* Main Content Area */}
										<div className='flex-1 py-3 pl-4 pr-2 min-w-0'>
											<div
												className={`font-bold text-sm truncate mb-0.5 ${
													isActive ? 'text-amber-900' : 'text-foreground'
												}`}>
												{item.name || item.title}
											</div>
											<div className='flex items-center justify-between'>
												<div className='text-[10px] text-muted-foreground truncate w-full'>
													{item.summary || item.narrative || item.description || 'No description'}
												</div>
												{/* Status Dot */}
												{item.status && (
													<div
														title={item.status}
														className={`w-1.5 h-1.5 rounded-full shrink-0 ${
															item.status.toLowerCase().includes('active')
																? 'bg-emerald-500/100'
																: item.status.toLowerCase().includes('dead')
																? 'bg-red-500/100'
																: 'bg-slate-300'
														}`}
													/>
												)}
											</div>
										</div>

										{/* Action Buttons (Visible on Hover) */}
										<div
											className={`flex flex-col gap-1 pr-1 pl-1 ${
												isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
											} transition-opacity`}>
											<button
												onClick={(e) => handleDuplicate(item.id, e)}
												className='p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-100 rounded'
												title='Duplicate'>
												{isCloning === item.id ? <Loader2 size={12} className='animate-spin' /> : <Copy size={12} />}
											</button>
											<button
												onClick={(e) => handleDelete(item.id, e)}
												className='p-1 text-muted-foreground hover:text-red-600 hover:bg-red-100 rounded'
												title='Delete'>
												{isDeleting === item.id ? <Loader2 size={12} className='animate-spin' /> : <Trash2 size={12} />}
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* --- RIGHT PANE: EDITOR --- */}
			<div className='flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8 custom-scrollbar'>
				<div className='max-w-4xl mx-auto'>
					<AdminForm key={`${normalizedType}-${id || 'new'}`} type={normalizedType} id={id} />
				</div>
			</div>
		</div>
	);
}
