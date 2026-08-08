import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import EntitySearch from './EntitySearch';
import { fetchRelationships, addRelationship, deleteRelationship } from '@/features/admin/api/adminService';

export default function EventTagger({ eventId }) {
	const [isAdding, setIsAdding] = useState(false);

	// If it's a temporary event (unsaved), we can't tag yet
	const isTemp = String(eventId).startsWith('new-');

	// Tags are server state. Disabled for unsaved (temp) events, which have no row
	// to relate to yet. `refetch` replaces the old manual reloads after mutations.
	const {
		data: tags = [],
		isLoading: loading,
		refetch,
	} = useQuery({
		queryKey: ['admin-event-tags', eventId],
		queryFn: () => fetchRelationships(eventId),
		enabled: !isTemp && !!eventId,
	});

	const handleAdd = async (target) => {
		if (tags.find((t) => t.target?.id === target.id)) return;

		setIsAdding(true);
		try {
			await addRelationship({
				from_entity_id: eventId,
				to_entity_id: target.id,
				relationship_type: 'mention', // Standard type for events
				is_bidirectional: false,
			});
			refetch();
		} catch (e) {
			alert(e.message);
		} finally {
			setIsAdding(false);
		}
	};

	const handleRemove = async (relId) => {
		try {
			await deleteRelationship(relId);
			refetch();
		} catch (e) {
			alert(e.message);
		}
	};

	if (isTemp) {
		return <div className='text-xs text-amber-600 bg-amber-500/10 p-2 rounded'>Save this event to enable tagging.</div>;
	}

	return (
		<div className='space-y-2 mt-2 pt-2 border-t border-border/50'>
			<label className='text-[10px] font-bold uppercase text-muted-foreground'>Mentions / Related Entities</label>

			{/* Tag List */}
			<div className='flex flex-wrap gap-2 mb-2'>
				{tags.map((rel) => (
					<div
						key={rel.id}
						className='flex items-center gap-1 bg-card border border-border px-2 py-1 rounded-md text-xs shadow-sm'>
						<span className='font-medium text-foreground'>{rel.target?.name}</span>
						<span className='text-[9px] text-muted-foreground uppercase'>{rel.target?.type}</span>
						<button onClick={() => handleRemove(rel.id)} className='ml-1 text-muted-foreground/70 hover:text-red-500'>
							<X size={12} />
						</button>
					</div>
				))}
				{loading && <Loader2 size={14} className='animate-spin text-muted-foreground' />}
			</div>

			{/* Search Input — disabled mid-add so a second pick can't race the first */}
			<div className='max-w-xs flex items-center gap-2'>
				<EntitySearch onSelect={handleAdd} disabled={isAdding} />
				{isAdding && <Loader2 size={14} className='animate-spin text-muted-foreground shrink-0' />}
			</div>
		</div>
	);
}
