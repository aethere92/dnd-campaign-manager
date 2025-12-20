import { Search, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { SearchResultItem } from './SearchResultItem';

export const SearchResults = ({ vm }) => {
	const { query, results, isLoading, recentSearches, selectedIndex, setSelectedIndex, handleSelect, clearRecent } = vm;

	return (
		<div className='max-h-[60vh] overflow-y-auto'>
			{query.trim() === '' ? (
				// Recent Searches / Empty State
				<div className='p-4'>
					{recentSearches.length > 0 ? (
						<>
							<div className='flex items-center justify-between mb-3'>
								<h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400'>Recent Searches</h3>
								<button onClick={clearRecent} className='text-xs text-gray-400 hover:text-foreground transition-colors'>
									Clear
								</button>
							</div>
							<div className='space-y-1'>
								{recentSearches.map((item) => (
									<button
										key={item.id}
										onClick={() => handleSelect(item)}
										className='w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left group'>
										<div
											className={clsx(
												'shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center',
												item.theme.bg,
												item.theme.border,
												item.theme.text
											)}>
											<item.icon size={14} />
										</div>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2 mb-0.5'>
												<span className='text-sm font-semibold text-foreground truncate'>{item.name}</span>
												<span className='shrink-0 text-[10px] uppercase font-bold tracking-wider text-gray-400'>
													{item.type}
												</span>
											</div>
											<p className='text-xs text-gray-500 line-clamp-1'>{item.description}</p>
										</div>
										<Clock
											size={14}
											className='shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity'
										/>
									</button>
								))}
							</div>
						</>
					) : (
						<div className='text-center py-12'>
							<Search size={40} className='mx-auto text-gray-300 mb-3' />
							<p className='text-sm font-medium text-foreground mb-1'>Start typing to search</p>
							<p className='text-xs text-gray-500'>
								Search across sessions, characters, locations, quests, NPCs, and more
							</p>
						</div>
					)}
				</div>
			) : isLoading ? (
				<div className='text-center py-12'>
					<div className='inline-block w-8 h-8 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin' />
					<p className='text-sm text-gray-500 mt-3'>Searching...</p>
				</div>
			) : results.length > 0 ? (
				// Search Results
				<div className='py-2'>
					{results.map((item, idx) => (
						<SearchResultItem
							key={item.id}
							item={item}
							isSelected={idx === selectedIndex}
							onSelect={() => handleSelect(item)}
							onHover={() => setSelectedIndex(idx)}
						/>
					))}
				</div>
			) : (
				// No Results
				<div className='text-center py-12 px-4'>
					<Search size={40} className='mx-auto text-gray-300 mb-3' />
					<p className='text-sm font-medium text-foreground mb-1'>No results found for "{query}"</p>
					<p className='text-xs text-gray-500'>Try different keywords or check your spelling</p>
				</div>
			)}
		</div>
	);
};
