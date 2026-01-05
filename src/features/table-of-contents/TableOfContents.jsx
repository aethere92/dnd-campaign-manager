import { useState, useEffect, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { List, ChevronRight, ChevronDown } from 'lucide-react';
import { useTocObserver } from './hooks/useTocObserver';
import { useTocScroll } from './hooks/useTocScroll';
import { TocMobileDrawer } from './components/TocMobileDrawer';

export const TableOfContents = ({
	items,
	className,
	visibilityClass = 'hidden xl:block',
	mobileToggleClass = 'xl:hidden',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [expandedIds, setExpandedIds] = useState(new Set());

	// NAV LOCK
	const isNavigating = useRef(false);
	const scrollTimeout = useRef(null);

	const itemIds = useMemo(() => items?.map((i) => i.id) || [], [items]);
	const activeId = useTocObserver(itemIds);
	const { scrollToId: originalScrollTo } = useTocScroll(() => setIsOpen(false));

	// 1. Parent Map
	const parents = useMemo(() => {
		const parentMap = new Map();
		for (let i = 0; i < items.length - 1; i++) {
			const current = items[i];
			const next = items[i + 1];
			if (current.depth === 2 && next.depth === 3) {
				const children = [];
				for (let j = i + 1; j < items.length; j++) {
					if (items[j].depth <= current.depth) break;
					children.push(items[j].id);
				}
				parentMap.set(current.id, children);
			}
		}
		return parentMap;
	}, [items]);

	// 2. Scroll Handler
	const handleScrollTo = (id) => {
		isNavigating.current = true;
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

		let targetParentId = null;
		if (parents.has(id)) targetParentId = id;
		else {
			for (const [pId, children] of parents.entries()) {
				if (children.includes(id)) {
					targetParentId = pId;
					break;
				}
			}
		}

		if (targetParentId) setExpandedIds(new Set([targetParentId]));
		originalScrollTo(id);

		scrollTimeout.current = setTimeout(() => {
			isNavigating.current = false;
		}, 1000);
	};

	// 3. Auto-Expand
	useEffect(() => {
		if (isNavigating.current || !activeId) return;

		let activeParentId = null;
		if (parents.has(activeId)) activeParentId = activeId;
		else {
			for (const [pId, children] of parents.entries()) {
				if (children.includes(activeId)) {
					activeParentId = pId;
					break;
				}
			}
		}

		setExpandedIds((prev) => {
			if (activeParentId) {
				if (prev.size === 1 && prev.has(activeParentId)) return prev;
				return new Set([activeParentId]);
			}
			if (prev.size === 0) return prev;
			return new Set();
		});
	}, [activeId, parents]);

	// Toggle Handler
	const toggleExpand = (e, id) => {
		e.preventDefault();
		e.stopPropagation();
		setExpandedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) newSet.delete(id);
			else newSet.add(id);
			return newSet;
		});
	};

	if (!items || items.length === 0) return null;

	return (
		<>
			{/* --- DESKTOP RAIL --- */}
			<aside
				className={clsx(
					visibilityClass,
					'sticky top-24 max-h-[calc(100vh-6rem)] w-64 shrink-0 self-start overflow-y-auto custom-scrollbar py-4 pr-2',
					className
				)}>
				<div className='flex flex-col'>
					<nav className='relative ml-4 flex flex-col border-l border-border/60'>
						<div className='mb-2 pl-4 text-sm font-semibold tracking-tight text-foreground/90'>On this page</div>
						{items.map((item) => {
							const hasChildren = parents.has(item.id);
							const isExpanded = expandedIds.has(item.id);

							let isHidden = false;
							if (item.depth === 3) {
								const parentIndex = items.slice(0, items.indexOf(item)).findLastIndex((i) => i.depth === 2);
								if (parentIndex !== -1) {
									const parent = items[parentIndex];
									if (parents.has(parent.id) && !expandedIds.has(parent.id)) isHidden = true;
								}
							}

							if (isHidden) return null;

							return (
								<div
									key={item.id}
									className={clsx('relative flex items-center', item.depth === 1 ? 'mb-1 mt-3' : 'mt-0')}>
									<div
										className={clsx(
											'absolute left-0 -ml-[1px] h-full w-[2px] transition-colors duration-200',
											activeId === item.id ? 'bg-primary' : 'bg-transparent'
										)}
									/>
									<div className='group flex w-full items-center justify-between'>
										<a
											href={`#${item.id}`}
											onClick={(e) => {
												e.preventDefault();
												handleScrollTo(item.id);
											}}
											className={clsx(
												'block w-full truncate py-1 pr-2 transition-colors',
												'text-[13px] leading-snug',
												activeId === item.id
													? 'font-medium text-primary'
													: 'text-muted-foreground hover:text-foreground',
												item.depth === 1 && 'pl-4 text-xs font-bold uppercase tracking-wider text-foreground/80',
												item.depth === 2 && 'pl-4',
												item.depth === 3 && 'pl-8 text-muted-foreground/80'
											)}>
											{item.text}
										</a>
										{hasChildren && (
											<button
												onClick={(e) => toggleExpand(e, item.id)}
												className='mr-1 shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
												aria-label={isExpanded ? 'Collapse' : 'Expand'}>
												{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
											</button>
										)}
									</div>
								</div>
							);
						})}
					</nav>
				</div>
			</aside>

			{/* --- MOBILE TOGGLE --- */}
			<div className={clsx('fixed bottom-6 right-6 z-40', mobileToggleClass)}>
				<button
					onClick={() => setIsOpen(true)}
					className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:bg-primary/90 active:scale-95'>
					<List size={20} />
				</button>
			</div>

			{/* --- MOBILE DRAWER (Now receiving state) --- */}
			<TocMobileDrawer
				isOpen={isOpen}
				items={items}
				activeId={activeId}
				parents={parents}
				expandedIds={expandedIds}
				toggleExpand={toggleExpand}
				onClose={() => setIsOpen(false)}
				onScrollTo={handleScrollTo}
			/>
		</>
	);
};
