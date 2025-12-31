import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import { StatusIcon } from './StatusIcon';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { resolveEntityIcon } from '@/domain/entity/config/entityIcons'; // Import

export const SidebarTreeItem = ({ item, onItemClick }) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = item.children && item.children.length > 0;
	const showStatus = ['npc', 'faction', 'quest'].includes(item.type);

	const iconUrl = resolveImageUrl(item.attributes, 'icon');
	const hasCustomIcon = !!iconUrl;

	// Use centralized resolver
	const ResolvedIcon = resolveEntityIcon({ type: item.type, attributes: item.attributes });

	return (
		<div className='select-none font-sans'>
			<div className='flex items-center w-full group py-0.5 hover:bg-black/5 rounded-sm transition-colors'>
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (hasChildren) setIsExpanded(!isExpanded);
					}}
					className={clsx(
						'w-5 h-6 flex items-center justify-center shrink-0 text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer',
						!hasChildren && 'invisible pointer-events-none'
					)}>
					{isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
				</button>

				<NavLink
					to={item.path}
					onClick={onItemClick}
					className={({ isActive }) =>
						clsx(
							'flex-1 flex items-center gap-1.5 pr-2 text-[13px] truncate transition-colors rounded-r-sm',
							// FIX: Replaced 'text-accent' with 'text-primary' and background
							isActive ? 'text-primary font-bold bg-primary/10' : 'text-foreground/80'
						)
					}>
					<span
						className={clsx(
							'shrink-0 flex items-center justify-center',
							!hasCustomIcon && 'opacity-100',
							// Ensure icon inherits color when active
							!hasCustomIcon && (item.type === 'location' ? 'text-muted-foreground' : 'text-muted-foreground')
						)}>
						{hasCustomIcon ? (
							<EntityIcon type={item.type} customIconUrl={iconUrl} size={14} />
						) : (
							<ResolvedIcon size={14} strokeWidth={2} />
						)}
					</span>

					<span className='truncate'>{item.name}</span>
					{showStatus && (
						<span className='ml-auto opacity-70 flex items-center'>
							<StatusIcon entity={item} />
						</span>
					)}
				</NavLink>
			</div>
			{isExpanded && hasChildren && (
				<div className='ml-[9px] border-l border-border/60 pl-1'>
					{item.children.map((child) => (
						<SidebarTreeItem key={child.id} item={child} onItemClick={onItemClick} />
					))}
				</div>
			)}
		</div>
	);
};
