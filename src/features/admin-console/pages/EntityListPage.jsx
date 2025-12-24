import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Edit, Plus, Search, Loader2, Copy, Trash2 } from 'lucide-react';
import { getEntities } from '../../../services/entities';
import { createEntity, fetchRawEntity, deleteEntity } from '../../../services/admin';
import { useCampaign } from '../../campaign-session/CampaignContext';
import Button from '../../../components/ui/Button';
import EntityBadge from '../../../components/entity/EntityBadge';

export default function EntityListPage() {
	const { type } = useParams(); // e.g., 'npc', 'location'
	const navigate = useNavigate();
	const { campaignId } = useCampaign();
	const [search, setSearch] = useState('');
	const [isCloning, setIsCloning] = useState(null); // Stores ID of item being cloned
	const [isDeleting, setIsDeleting] = useState(null);

	const normalizedType = type === 'sessions' ? 'session' : type;

	// 1. Fetch List Data
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['admin-list', campaignId, normalizedType],
		queryFn: () => getEntities(campaignId, normalizedType),
		enabled: !!campaignId,
	});

	const filtered = (data || []).filter((item) =>
		(item.name || item.title || '').toLowerCase().includes(search.toLowerCase())
	);

	// 2. Handle Duplication
	const handleDuplicate = async (originalId) => {
		if (!confirm('Create a copy of this entity?')) return;

		setIsCloning(originalId);
		try {
			// A. Fetch original raw data (exactly as DB sees it)
			const raw = await fetchRawEntity(normalizedType, originalId);

			// B. Prepare Copy Data
			// We strip the ID so Supabase creates a new one
			// We modify the name so you know it's a copy
			const copyData = {
				...raw,
				name: raw.name ? `${raw.name} (Copy)` : undefined,
				title: raw.title ? `${raw.title} (Copy)` : undefined,
				campaign_id: campaignId,
			};

			// C. Create the new entity
			const result = await createEntity(normalizedType, copyData);

			// D. Navigate to the new Editor
			navigate(`/dm/editor/${normalizedType}/${result.id}`);
		} catch (e) {
			console.error('Duplication failed:', e);
			alert('Failed to duplicate: ' + e.message);
			setIsCloning(false); // Only reset if failed (otherwise we navigate away)
		}
	};

	const handleDelete = async (id) => {
		if (!confirm(`Are you sure you want to delete this ${normalizedType}? This cannot be undone.`)) return;

		setIsDeleting(id);
		try {
			await deleteEntity(normalizedType, id);
			// Refresh list
			refetch();
		} catch (e) {
			alert('Delete failed: ' + e.message);
		} finally {
			setIsDeleting(null);
		}
	};

	return (
		<div className='space-y-4 animate-in fade-in duration-300'>
			{/* --- Header Toolbar --- */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
				<h1 className='text-2xl font-serif font-bold text-foreground capitalize flex items-center gap-2'>
					{type}s
					<span className='text-sm font-sans font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border'>
						{data?.length || 0}
					</span>
				</h1>
				<Link to={`/dm/editor/${normalizedType}`}>
					<Button variant='primary' icon={Plus} size='sm'>
						Create New
					</Button>
				</Link>
			</div>

			{/* --- Search Bar --- */}
			<div className='relative'>
				<Search className='absolute left-3 top-2.5 text-muted-foreground/60' size={16} />
				<input
					type='text'
					placeholder={`Filter ${type}s...`}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm placeholder:text-muted-foreground/50'
				/>
			</div>

			{/* --- Entity List --- */}
			<div className='bg-background border border-border rounded-lg shadow-sm overflow-hidden'>
				<div className='divide-y divide-border'>
					{isLoading ? (
						<div className='p-12 flex justify-center text-muted-foreground'>
							<Loader2 className='animate-spin text-amber-600' />
						</div>
					) : filtered.length === 0 ? (
						<div className='p-12 text-center text-muted-foreground text-sm italic bg-muted/10'>
							{search ? `No matches for "${search}"` : `No ${type}s found. Create one to get started.`}
						</div>
					) : (
						filtered.map((item) => (
							<div
								key={item.id}
								className='group flex items-center justify-between p-3 hover:bg-muted/40 transition-colors'>
								{/* Left: Info */}
								<div className='flex items-center gap-3 min-w-0 flex-1'>
									<div className='min-w-0'>
										<div className='flex items-center gap-2'>
											<span className='font-medium text-sm text-foreground truncate'>{item.name || item.title}</span>
											{/* Show badge if type differs from current view (e.g. searching generic entities) */}
											{item.type !== normalizedType && <EntityBadge type={item.type} size='sm' variant='subtle' />}
										</div>
										<div className='text-[11px] text-muted-foreground truncate max-w-xl'>
											{item.summary || item.narrative || item.description || 'No description'}
										</div>
									</div>
								</div>

								{/* Right: Actions */}
								<div className='flex items-center gap-2 shrink-0 ml-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
									<EntityBadge
										type={item.type}
										size='sm'
										variant='outline'
										className='opacity-50 hidden sm:inline-flex'
									/>

									{/* Duplicate Button */}
									<button
										onClick={() => handleDuplicate(item.id)}
										disabled={isCloning === item.id}
										className='p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500'
										title='Duplicate'>
										{isCloning === item.id ? (
											<Loader2 size={16} className='animate-spin text-amber-600' />
										) : (
											<Copy size={16} />
										)}
									</button>

									{/* Edit Button */}
									<Link to={`/dm/editor/${normalizedType}/${item.id}`}>
										<Button
											variant='ghost'
											size='sm'
											icon={Edit}
											className='h-8 px-2 text-muted-foreground hover:text-foreground'>
											Edit
										</Button>
									</Link>

									{/* Delete */}
									<button
										onClick={() => handleDelete(item.id)}
										disabled={isDeleting === item.id}
										className='p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
										title='Delete'>
										{isDeleting === item.id ? <Loader2 size={16} className='animate-spin' /> : <Trash2 size={16} />}
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
