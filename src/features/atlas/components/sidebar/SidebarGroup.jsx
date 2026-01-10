import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { SidebarItem } from './SidebarItem';

export const SidebarGroup = ({ label, items, visibility, onToggleItem, onToggleGroup, onFlyTo }) => {
	const [isExpanded, setIsExpanded] = useState(true);

	const visibleCount = items.filter((i) => visibility[i.id]).length;
	const isAllVisible = visibleCount === items.length;
	const isNoneVisible = visibleCount === 0;
	const isMixed = !isAllVisible && !isNoneVisible;

	const handleGroupToggle = (e) => {
		e.stopPropagation();
		// If mixed, turn ON. If all on, turn OFF.
		onToggleGroup(
			items.map((i) => i.id),
			isMixed ? true : !isAllVisible
		);
	};

	return (
		<div className='mb-0.5'>
			<div className='flex items-center gap-1 px-2 py-2 md:py-1 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 select-none group/header hover:bg-black/5 rounded-md'>
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className='p-1 text-muted-foreground hover:text-foreground transition-colors'>
					{isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
				</button>

				<span
					className='flex-1 text-xs md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer truncate'
					onClick={() => setIsExpanded(!isExpanded)}>
					{label} <span className='opacity-50 ml-1'>({items.length})</span>
				</span>

				<button
					onClick={handleGroupToggle}
					className={clsx(
						'p-1 rounded transition-colors',
						isAllVisible ? 'text-primary' : isMixed ? 'text-primary/70' : 'text-muted-foreground/30'
					)}>
					{isAllVisible ? <Eye size={12} /> : isMixed ? <Eye size={12} className='opacity-50' /> : <EyeOff size={12} />}
				</button>
			</div>

			{isExpanded && (
				<div className='pl-1 space-y-0.5 ml-2 border-l border-border/40'>
					{items.map((item) => (
						<SidebarItem
							key={item.id}
							label={item.label}
							isVisible={!!visibility[item.id]}
							onToggle={() => onToggleItem(item.id)}
							onNavigate={() => onFlyTo(item.position)}
						/>
					))}
				</div>
			)}
		</div>
	);
};
