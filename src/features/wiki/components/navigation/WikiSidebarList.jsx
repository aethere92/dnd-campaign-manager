import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { SidebarEmptyState } from './SidebarEmptyState';
import { CollapsibleGroup } from './sidebar/CollapsibleGroup';
import { EntityListItem } from './sidebar/EntityListItem';
import { SidebarTreeItem } from './sidebar/SidebarTreeItem';

export const WikiSidebarList = ({ groups, isLoading, hasItems, config, onItemClick }) => {
	if (isLoading) {
		return (
			<div className='p-8 flex justify-center'>
				<LoadingSpinner size='sm' text='Loading...' />
			</div>
		);
	}

	if (!hasItems) {
		return <SidebarEmptyState label={config.label} />;
	}

	const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
	if (totalItems === 0) {
		return <div className='p-6 text-center text-xs text-muted-foreground/70 italic'>No matches found.</div>;
	}

	const isGrouped = !groups[0].isTree && (groups.length > 1 || (groups.length === 1 && groups[0].title !== null));

	return (
		// FIX: Removed 'pb-10'. The parent flex container handles the scroll bounds now.
		// Added 'pb-2' just for a tiny bit of visual breathing room at the very end.
		<div className='bg-muted py-1 pb-2'>
			{/* MODE 1: TREE (Recursive) */}
			{groups[0].isTree ? (
				<div className='px-1 space-y-0.5'>
					{groups[0].items.map((item) => (
						<SidebarTreeItem key={item.id} item={item} onItemClick={onItemClick} />
					))}
				</div>
			) : /* MODE 2: GROUPED (Collapsible Categories) */
			isGrouped ? (
				<div className='space-y-1'>
					{groups.map((group) => (
						<CollapsibleGroup key={group.id} group={group} onItemClick={onItemClick} />
					))}
				</div>
			) : (
				/* MODE 3: FLAT LIST */
				<div className='px-2 space-y-0.5'>
					{groups[0].items.map((item) => {
						const showStatus = ['npc', 'faction', 'quest'].includes(item.type);
						return <EntityListItem key={item.id} item={item} showStatus={showStatus} onItemClick={onItemClick} />;
					})}
				</div>
			)}
		</div>
	);
};
