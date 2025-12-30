import { useState } from 'react';
import { clsx } from 'clsx';
import { List, AlignLeft } from 'lucide-react';
import { useTocObserver } from './hooks/useTocObserver';
import { useTocScroll } from './hooks/useTocScroll';
import { TocItem } from './components/TocItem';
import { TocMobileDrawer } from './components/TocMobileDrawer';

export const TableOfContents = ({
	items,
	className,
	visibilityClass = 'hidden 2xl:block',
	mobileToggleClass = '2xl:hidden',
}) => {
	const [isOpen, setIsOpen] = useState(false);

	// Hooks
	const activeId = useTocObserver(items.map((i) => i.id));
	const { scrollToId } = useTocScroll(() => setIsOpen(false));

	if (!items || items.length === 0) return null;

	const renderList = () => (
		<div className='flex flex-col space-y-0.5'>
			{items.map((item) => (
				<TocItem key={item.id} item={item} isActive={activeId === item.id} onClick={scrollToId} />
			))}
		</div>
	);

	return (
		<>
			{/* --- DESKTOP VIEW --- */}
			{/* 
				Sticky Positioning Logic:
				- top-40 (160px): Increased from top-32 to ensure no overlap with sticky TabContainers or Headers.
				- self-start: Critical for CSS Grid contexts (like Timeline) to prevent the item from stretching 
				  to full height, which breaks sticky behavior.
			*/}
			<div className={clsx(visibilityClass, 'sticky top-90 w-64 shrink-0 self-start', className)}>
				<div className='max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar pb-10 pr-2'>
					<div className='flex items-center gap-2 mb-4 px-4 text-xs font-bold uppercase tracking-widest text-gray-400'>
						<AlignLeft size={12} />
						<span>On this Page</span>
					</div>
					<nav>{renderList()}</nav>
				</div>
			</div>

			{/* --- MOBILE/TABLET TOGGLE --- */}
			<div className={clsx('fixed bottom-6 right-6 z-40', mobileToggleClass)}>
				<button
					onClick={() => setIsOpen(true)}
					className='h-12 w-12 bg-background border border-border shadow-lg rounded-full flex items-center justify-center text-foreground hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all active:scale-95'
					aria-label='Open Table of Contents'>
					<List size={20} />
				</button>
			</div>

			{/* --- MOBILE DRAWER --- */}
			<TocMobileDrawer
				isOpen={isOpen}
				items={items}
				activeId={activeId}
				onClose={() => setIsOpen(false)}
				onScrollTo={scrollToId}
			/>
		</>
	);
};
