import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

export const WikiSidebarHeader = ({ config, search, onSearchChange, onToggle, isOpen, renderDesktopToggle }) => {
	const { Icon, label, textClass } = config;

	return (
		<div className='p-3 lg:p-4 bg-muted border-b border-border/50'>
			{/* Title Row - Clickable on mobile */}
			<div
				className='flex items-center justify-between cursor-pointer lg:cursor-default select-none h-8'
				onClick={onToggle}>
				<div className='flex items-center gap-3 min-w-0 w-full'>
					{Icon && <Icon size={18} className={clsx(textClass, 'shrink-0')} />}
					<h1 className='text-sm font-serif font-bold text-foreground capitalize tracking-wide truncate'>{label}</h1>

					{/* FIX: Render desktop toggle here to avoid overlap */}
					{renderDesktopToggle && <div className='hidden lg:block shrink-0 ml-auto mr-1'>{renderDesktopToggle()}</div>}
				</div>

				{/* Mobile Toggle Button - Larger Touch Target */}
				<button
					className='lg:hidden text-muted-foreground hover:text-foreground active:bg-black/10 p-2 -mr-2 rounded-md transition-colors'
					aria-label={isOpen ? 'Collapse' : 'Expand'}>
					{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
				</button>
			</div>

			{/* Search Bar */}
			<div className={clsx('mt-3 relative', !isOpen && 'hidden lg:block')}>
				<Search className='absolute left-3 top-2.5 text-muted-foreground/70' size={14} />
				<input
					type='text'
					placeholder='Filter list...'
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					onClick={(e) => e.stopPropagation()}
					className='w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-base lg:text-xs focus:ring-1 focus:ring-primary/50 focus:border-primary outline-none transition-shadow shadow-sm'
				/>
			</div>
		</div>
	);
};
