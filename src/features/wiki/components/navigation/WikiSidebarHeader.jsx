import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

export const WikiSidebarHeader = ({ config, search, onSearchChange, onToggle, isOpen }) => {
	const { Icon, label, textClass } = config;

	return (
		<div className='p-3 lg:p-4 bg-muted border-b border-border/50'>
			{/* Title Row - Clickable on mobile */}
			<div
				className='flex items-center justify-between cursor-pointer lg:cursor-default select-none h-8'
				onClick={onToggle}>
				<div className='flex items-center gap-3'>
					{Icon && <Icon size={18} className={textClass} />}
					<h1 className='text-sm font-serif font-bold text-foreground capitalize tracking-wide'>{label}</h1>
				</div>

				{/* Mobile Toggle Button - Larger Touch Target */}
				<button
					className='lg:hidden text-gray-500 hover:text-foreground active:bg-black/10 p-2 -mr-2 rounded-md transition-colors'
					aria-label={isOpen ? 'Collapse' : 'Expand'}>
					{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
				</button>
			</div>

			{/* Search Bar */}
			<div className={clsx('mt-3 relative', !isOpen && 'hidden lg:block')}>
				<Search className='absolute left-3 top-2.5 text-gray-400' size={14} />
				<input
					type='text'
					placeholder='Filter list...'
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					onClick={(e) => e.stopPropagation()}
					// Prevent iOS zoom on focus by ensuring font-size is 16px (text-base) on mobile
					className='w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-base lg:text-xs focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-shadow shadow-sm'
				/>
			</div>
		</div>
	);
};
