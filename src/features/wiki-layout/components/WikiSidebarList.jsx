import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { SidebarEmptyState } from './SidebarEmptyState';
import { CollapsibleGroup } from './sidebar/CollapsibleGroup';
import { EntityListItem } from './sidebar/EntityListItem';

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

	// Flatten check for empty search results
	const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
	if (totalItems === 0) {
		return <div className='p-6 text-center text-xs text-gray-400 italic'>No matches found.</div>;
	}

	// Check if we have grouped data (multiple groups with titles)
	const isGrouped = groups.length > 1 || (groups.length === 1 && groups[0].title !== null);

	return (
		<div className='lg:overflow-y-auto lg:h-full bg-muted py-1'>
			{isGrouped ? (
				// Collapsible Groups
				<div className='space-y-1'>
					{groups.map((group) => (
						<CollapsibleGroup key={group.id} group={group} onItemClick={onItemClick} />
					))}
				</div>
			) : (
				// Flat List (No Grouping)
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
