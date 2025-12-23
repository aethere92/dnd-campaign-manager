import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
// We'll leave out StatusIcon/PriorityIcon for locations generally,
// but it's extensible if needed.

export const SidebarTreeItem = ({ item, onItemClick }) => {
	// Auto-expand if the item has a lot of children or is a "Continent" style root
	// For now, default closed for cleaner UI
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = item.children && item.children.length > 0;

	return (
		<div className='select-none font-sans'>
			<div className='flex items-center w-full group py-0.5 hover:bg-black/5 rounded-sm transition-colors'>
				{/* EXPAND TOGGLE */}
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (hasChildren) setIsExpanded(!isExpanded);
					}}
					className={clsx(
						'w-6 h-6 flex items-center justify-center shrink-0 text-gray-400 hover:text-foreground transition-colors cursor-pointer',
						!hasChildren && 'invisible pointer-events-none'
					)}>
					{isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
				</button>

				{/* ENTITY LINK */}
				<NavLink
					to={item.path}
					onClick={onItemClick}
					className={({ isActive }) =>
						clsx(
							'flex-1 flex items-center gap-2 pr-2 text-[13px] truncate transition-colors rounded-r-sm',
							isActive ? 'text-accent font-semibold bg-accent/5' : 'text-gray-700'
						)
					}>
					<span className='truncate'>{item.name}</span>
				</NavLink>
			</div>

			{/* RECURSIVE CHILDREN */}
			{isExpanded && hasChildren && (
				<div className='ml-[11px] border-l border-border/60 pl-1'>
					{item.children.map((child) => (
						<SidebarTreeItem key={child.id} item={child} onItemClick={onItemClick} />
					))}
				</div>
			)}
		</div>
	);
};
