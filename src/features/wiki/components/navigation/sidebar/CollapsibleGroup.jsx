import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { EntityListItem } from './EntityListItem';

export const CollapsibleGroup = ({ group, onItemClick }) => {
	const [isOpen, setIsOpen] = useState(true);

	// Determine if we should show status icons
	const showStatus = group.items.some((item) => ['npc', 'faction', 'quest'].includes(item.type));

	return (
		<div className='select-none'>
			{/* Group Header - Collapsible */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground/80 hover:bg-black/5 transition-colors'>
				{isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
				<span className='truncate'>{group.title}</span>
				<span className='ml-auto text-[10px] font-normal text-muted-foreground/70'>{group.items.length}</span>
			</button>

			{/* Items */}
			{isOpen && (
				<div className='space-y-0.5 pb-1'>
					{group.items.map((item) => (
						<EntityListItem key={item.id} item={item} showStatus={showStatus} onItemClick={onItemClick} />
					))}
				</div>
			)}
		</div>
	);
};
