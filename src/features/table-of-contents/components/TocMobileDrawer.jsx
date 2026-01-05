import { Drawer } from '@/shared/components/ui/Drawer';
import { clsx } from 'clsx';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const TocMobileDrawer = ({
	isOpen,
	items,
	activeId,
	parents, // passed from parent
	expandedIds, // passed from parent
	toggleExpand, // passed from parent
	onClose,
	onScrollTo,
}) => {
	return (
		<Drawer isOpen={isOpen} onClose={onClose} title='Table of Contents' position='right'>
			<div className='flex flex-col py-4'>
				<nav className='relative flex flex-col'>
					{items.map((item) => {
						const hasChildren = parents.has(item.id);
						const isExpanded = expandedIds.has(item.id);

						// Hiding Logic (Same as Desktop)
						let isHidden = false;
						if (item.depth === 3) {
							const parentIndex = items.slice(0, items.indexOf(item)).findLastIndex((i) => i.depth === 2);
							if (parentIndex !== -1) {
								const parent = items[parentIndex];
								if (parents.has(parent.id) && !expandedIds.has(parent.id)) {
									isHidden = true;
								}
							}
						}

						if (isHidden) return null;

						return (
							<div
								key={item.id}
								className={clsx('relative flex items-center', item.depth === 1 ? 'mb-2 mt-4' : 'mt-0')}>
								{/* Active Indicator Line (Thicker for Mobile) */}
								<div
									className={clsx(
										'absolute left-0 -ml-[2px] h-full w-[4px] rounded-r-sm transition-colors duration-200',
										activeId === item.id ? 'bg-primary' : 'bg-transparent'
									)}
								/>

								<div className='flex w-full items-center justify-between'>
									<button
										onClick={() => {
											onScrollTo(item.id);
											onClose(); // Close drawer on selection
										}}
										className={clsx(
											'flex h-full w-full items-center py-2 pr-4 text-left transition-colors',
											'text-[13px] leading-snug', // Slightly larger font than desktop
											activeId === item.id
												? 'text-[14px] text-primary'
												: 'text-muted-foreground active:text-foreground',
											item.depth === 1 && 'pl-5 text-xs font-bold uppercase tracking-wider text-foreground/80',
											item.depth === 2 && 'pl-5',
											item.depth === 3 && 'pl-9 text-muted-foreground/80'
										)}>
										{item.text}
									</button>

									{/* Toggle Button for Parents */}
									{hasChildren && (
										<button
											onClick={(e) => toggleExpand(e, item.id)}
											className='mr-2 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground active:bg-accent active:text-foreground'
											aria-label={isExpanded ? 'Collapse' : 'Expand'}>
											{isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
										</button>
									)}
								</div>
							</div>
						);
					})}
				</nav>
			</div>
		</Drawer>
	);
};
