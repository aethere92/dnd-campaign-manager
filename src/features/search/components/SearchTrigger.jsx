import { Search } from 'lucide-react';
import { useSearch } from '@/features/search/SearchContext'; // Import Context

export const SearchTrigger = ({ className, onClick }) => {
	const { openSearch } = useSearch();

	const handleClick = (e) => {
		openSearch();
		if (onClick) onClick(e);
	};

	return (
		<button
			onClick={handleClick}
			className={`w-full flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all group ${className}`}>
			<Search size={14} className='text-muted-foreground/70 group-hover:text-primary' />
			<span className='flex-1 text-left text-xs'>Search...</span>
			<kbd className='hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground/70 bg-muted border border-border rounded'>
				⌘K
			</kbd>
		</button>
	);
};
