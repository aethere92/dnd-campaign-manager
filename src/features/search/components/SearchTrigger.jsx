import { Search } from 'lucide-react';
import { useSearch } from '@/features/search/SearchContext'; // Import Context

export const SearchTrigger = ({ className }) => {
	const { openSearch } = useSearch();

	return (
		<button
			onClick={openSearch}
			className={`w-full flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-sm text-gray-500 hover:text-foreground hover:border-amber-500/50 transition-all group ${className}`}>
			<Search size={14} className='text-gray-400 group-hover:text-amber-600' />
			<span className='flex-1 text-left text-xs'>Search...</span>
			<kbd className='hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-muted border border-border rounded'>
				⌘K
			</kbd>
		</button>
	);
};
