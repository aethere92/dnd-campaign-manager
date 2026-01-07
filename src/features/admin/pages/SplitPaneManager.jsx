import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Loader2, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import { getEntities } from '@/domain/entity/api/entityService';
import { createEntity, fetchRawEntity, deleteEntity } from '@/features/admin/api/adminService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import AdminForm from '@/features/admin/components/AdminForm';
import Button from '@/shared/components/ui/Button';

// NEW IMPORTS
import AdvancedFilter from '@/features/admin/components/AdvancedFilter';
import { applyFilterRules } from '@/features/admin/utils/filterUtils';

const resolveImgUrl = (url) => {
	if (!url) return null;
	const cleanPath = url.replace(/(\.\.\/)+/g, '').replace(/^\//, '');
	return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export default function SplitPaneManager() {
	const { type, id } = useParams();
	const navigate = useNavigate();
	const { campaignId } = useCampaign();
	const normalizedType = type === 'sessions' ? 'session' : type;

	// State
	const [search, setSearch] = useState('');
	const [filterRules, setFilterRules] = useState([]); // Array of rules from AdvancedFilter

	// Action States
	const [isCloning, setIsCloning] = useState(null);
	const [isDeleting, setIsDeleting] = useState(null);

	// 1. Fetch Full List
	const {
		data: allEntities,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['admin-list', campaignId, normalizedType],
		queryFn: () => getEntities(campaignId, normalizedType),
		enabled: normalizedType === 'campaign' || !!campaignId,
	});

	// 2. Apply Filters & Search
	const displayedEntities = useMemo(() => {
		if (!allEntities) return [];

		// Step A: Basic Text Search (Name/Title)
		let result = allEntities.filter((item) => {
			const term = search.toLowerCase();
			return (item.name || '').toLowerCase().includes(term) || (item.title || '').toLowerCase().includes(term);
		});

		// Step B: Advanced Rules
		result = applyFilterRules(result, filterRules);

		return result;
	}, [allEntities, search, filterRules]);

	// ... (Duplicate/Delete handlers remain the same) ...
	const handleDuplicate = async (originalId, e) => {
		e.stopPropagation();
		if (!confirm('Create a copy?')) return;

		setIsCloning(originalId);
		try {
			const raw = await fetchRawEntity(normalizedType, originalId);
			const copyData = {
				...raw,
				name: raw.name ? `${raw.name} (Copy)` : undefined,
				title: raw.title ? `${raw.title} (Copy)` : undefined,
				campaign_id: campaignId,
			};
			delete copyData.id;

			const result = await createEntity(normalizedType, copyData);
			refetch();
			navigate(`/dm/manage/${normalizedType}/${result.id}`);
		} catch (e) {
			alert('Failed to duplicate: ' + e.message);
		} finally {
			setIsCloning(false);
		}
	};

	const handleDelete = async (itemId, e) => {
		e.stopPropagation();
		if (!confirm('Delete this entry?')) return;

		setIsDeleting(itemId);
		try {
			await deleteEntity(normalizedType, itemId);
			refetch();
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
				{/* HEADER */}
				<div className='p-3 border-b border-border space-y-3 bg-muted/10 relative z-20'>
					<div className='flex items-center justify-between mb-2'>
						<h2 className='text-lg font-serif font-bold capitalize text-foreground flex items-center gap-2'>
							{type}s
							<span className='text-xs font-sans font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border'>
								{allEntities?.length || 0}
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

					<div className='flex gap-2'>
						{/* Search Input */}
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2 text-muted-foreground/60' size={14} />
							<input
								type='text'
								placeholder='Search...'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className='w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm'
							/>
						</div>

						{/* ADVANCED FILTER BUTTON */}
						<AdvancedFilter type={normalizedType} data={allEntities || []} onFilterChange={setFilterRules} />
					</div>

					{/* Active Filter Summary (optional UI polish) */}
					{filterRules.length > 0 && (
						<div className='flex flex-wrap gap-1'>
							{filterRules.map((rule) => (
								<div
									key={rule.id}
									className='text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded truncate max-w-full'>
									{rule.field.split('.').pop()} {rule.operator === 'equals' ? '=' : rule.operator} {rule.value}
								</div>
							))}
						</div>
					)}
				</div>

				{/* LIST */}
				<div className='flex-1 overflow-y-auto custom-scrollbar'>
					{isLoading ? (
						<div className='p-8 flex justify-center'>
							<Loader2 className='animate-spin text-amber-600' />
						</div>
					) : displayedEntities.length === 0 ? (
						<div className='p-6 text-center text-xs text-muted-foreground italic'>No matches found.</div>
					) : (
						<div className='divide-y divide-border/40'>
							{displayedEntities.map((item) => {
								const isActive = id === item.id;
								const rawIcon = item.icon_url || item.attributes?.icon;
								const iconSrc = resolveImgUrl(rawIcon);

								return (
									<div
										key={item.id}
										onClick={() => navigate(`/dm/manage/${normalizedType}/${item.id}`)}
										className={`group relative flex items-center w-full text-left transition-all cursor-pointer ${
											isActive ? 'bg-amber-500/10/80' : 'bg-background hover:bg-muted/50'
										}`}>
										{/* Active Marker */}
										<div
											className={`absolute left-0 top-0 bottom-0 w-1 ${isActive ? 'bg-primary' : 'bg-transparent'}`}
										/>

										<div className='flex items-center gap-3 py-2 pl-3 pr-2 flex-1 min-w-0'>
											<div className='shrink-0 w-9 h-9 rounded bg-muted border border-border overflow-hidden flex items-center justify-center'>
												{iconSrc ? (
													<img
														src={iconSrc}
														className='w-full h-full object-cover'
														loading='lazy'
														onError={(e) => {
															e.target.style.display = 'none';
															e.target.nextSibling.style.display = 'flex';
														}}
													/>
												) : (
													<ImageIcon size={14} className='text-muted-foreground/30' />
												)}
												<div className='hidden w-full h-full items-center justify-center bg-muted'>
													<ImageIcon size={14} className='text-muted-foreground/30' />
												</div>
											</div>

											<div className='min-w-0 flex-1'>
												<div
													className={`font-bold text-sm truncate mb-0.5 leading-none ${
														isActive ? 'text-primary' : 'text-foreground'
													}`}>
													{item.name || item.title}
												</div>
												<div className='flex items-center justify-between gap-2'>
													<div className='text-[10px] text-muted-foreground truncate opacity-80'>
														{item.summary || item.narrative || item.description || 'No description'}
													</div>
													{item.status && (
														<div
															title={item.status}
															className={`w-1.5 h-1.5 rounded-full shrink-0 ${
																item.status.toLowerCase().includes('active') ? 'bg-emerald-500' : 'bg-slate-300'
															}`}
														/>
													)}
												</div>
											</div>
										</div>

										{/* Actions */}
										<div
											className={`flex flex-col gap-0.5 pr-1 pl-1 border-l border-transparent group-hover:border-border/50 h-full justify-center ${
												isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
											} transition-opacity bg-gradient-to-l from-background to-transparent`}>
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
