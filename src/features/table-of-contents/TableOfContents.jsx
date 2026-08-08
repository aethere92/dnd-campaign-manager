import { useState, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { List, ChevronRight, ChevronDown } from 'lucide-react';
import { useTocObserver } from './hooks/useTocObserver';
import { useTocScroll } from './hooks/useTocScroll';
import { TocMobileDrawer } from './components/TocMobileDrawer';

// Stable identity so a collapsed TOC doesn't produce a new Set every render.
const NOTHING_EXPANDED = new Set();

// Which depth-2 heading owns `id`? Returns `id` itself if it is a parent.
function findParentId(parents, id) {
	if (!id) return null;
	if (parents.has(id)) return id;
	for (const [parentId, children] of parents.entries()) {
		if (children.includes(id)) return parentId;
	}
	return null;
}

export const TableOfContents = ({
	items,
	className,
	visibilityClass = 'hidden xl:block',
	mobileToggleClass = 'xl:hidden',
}) => {
	const [isOpen, setIsOpen] = useState(false);

	// Expansion is derived from the active heading, with two overrides layered on
	// top. Previously this was one `expandedIds` state kept in sync by an effect,
	// which is what react-hooks/set-state-in-effect flagged: the effect ran after
	// paint, so the sidebar showed the previous section expanded for a frame.
	//
	// `pinnedParentId` is the old `isNavigating` ref turned into real state. Its job
	// is to hold the clicked section open while the smooth scroll animates past
	// intermediate headings — as a ref it could not affect rendering, so the auto
	// expansion had to be suppressed from inside the effect.
	const [pinnedParentId, setPinnedParentId] = useState(null);
	// A manual chevron click wins until the reader scrolls to a different section.
	const [manualExpanded, setManualExpanded] = useState(null);
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
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

		const targetParentId = findParentId(parents, id);

		// Pin the target open for the duration of the smooth scroll, so the
		// headings the viewport passes through on the way don't collapse it.
		setPinnedParentId(targetParentId);
		setManualExpanded(null);
		originalScrollTo(id);

		scrollTimeout.current = setTimeout(() => setPinnedParentId(null), 1000);
	};

	// 3. Auto-Expand — derived, not synced.
	const activeParentId = findParentId(parents, activeId);
	const autoParentId = pinnedParentId ?? activeParentId;

	// Memoised so the Set keeps a stable identity between renders of the same
	// section (a fresh Set every render would defeat memoisation downstream).
	const autoExpanded = useMemo(() => (autoParentId ? new Set([autoParentId]) : NOTHING_EXPANDED), [autoParentId]);

	// A manual toggle applies only while the reader is still in the section it was
	// made in; scrolling elsewhere hands control back to the active heading.
	const manualApplies = manualExpanded && manualExpanded.forParentId === autoParentId;
	const expandedIds = manualApplies ? manualExpanded.ids : autoExpanded;

	// Toggle Handler
	const toggleExpand = (e, id) => {
		e.preventDefault();
		e.stopPropagation();

		const next = new Set(expandedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);

		setManualExpanded({ forParentId: autoParentId, ids: next });
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
