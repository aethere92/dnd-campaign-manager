import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

export const WikiSidebarHeader = ({ config, search, onSearchChange, onToggle, isOpen }) => {
	const { Icon, label, textClass } = config;

	return (
		<div className='p-3 lg:p-4 bg-muted border-b border-border/50'>
			{/* Title Row - Clickable on mobile */}
			<div
				className='flex items-center justify-between cursor-pointer lg:cursor-default select-none'
				onClick={onToggle}>
				<div className='flex items-center gap-2.5'>
					{Icon && <Icon size={16} className={textClass} />}
					<h1 className='text-sm font-serif font-bold text-foreground capitalize tracking-wide'>{label}</h1>
				</div>

				{/* Mobile Toggle Button */}
				<button className='lg:hidden text-gray-500 hover:text-foreground hover:bg-black/5 p-1 rounded transition-colors'>
					{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
				</button>
			</div>

			{/* Search Bar - Always visible on desktop, hidden when collapsed on mobile */}
			<div className={clsx('mt-3 relative', !isOpen && 'hidden lg:block')}>
				<Search className='absolute left-2.5 top-2 text-gray-400' size={13} />
				<input
					type='text'
					placeholder='Filter list...'
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					onClick={(e) => e.stopPropagation()}
					className='w-full bg-background border border-border rounded-md pl-8 pr-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-shadow shadow-sm'
				/>
			</div>
		</div>
	);
};
