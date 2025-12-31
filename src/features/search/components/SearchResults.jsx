import { Search, Clock, Calendar, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { SearchResultItem } from './SearchResultItem';

const GroupHeader = ({ label, icon: Icon }) => (
	<div className='px-4 py-2 mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 bg-muted/50 border-y border-border/50 sticky top-0 z-10 backdrop-blur-sm'>
		<Icon size={12} />
		{label}
	</div>
);

export const SearchResults = ({ vm }) => {
	const { query, results, isLoading, recentSearches, selectedIndex, setSelectedIndex, handleSelect, clearRecent } = vm;

	// GROUPING LOGIC
	const groupedResults = results.reduce(
		(acc, item) => {
			const group = item.type === 'session' ? 'sessions' : 'entities';
			if (!acc[group]) acc[group] = [];
			acc[group].push(item);
			return acc;
		},
		{ sessions: [], entities: [] }
	);

	return (
		<div className='pb-4'>
			{query.trim() === '' ? (
				// Recent Searches / Empty State
				<div className='p-4'>
					{recentSearches.length > 0 ? (
						<>
							<div className='flex items-center justify-between mb-3'>
								<h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground/70'>Recent Searches</h3>
								<button onClick={clearRecent} className='text-xs text-muted-foreground/70 hover:text-foreground transition-colors'>
									Clear
								</button>
							</div>
							<div className='space-y-1'>
								{recentSearches.map((item) => (
									<button
										key={item.id}
										onClick={() => handleSelect(item)}
										className='w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left group'>
										<Clock size={14} className='mt-1 text-gray-300 group-hover:text-amber-600 transition-colors' />
										<span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
											{item.name}
										</span>
									</button>
								))}
							</div>
						</>
					) : (
						<div className='text-center py-12 opacity-60'>
							<Search size={40} className='mx-auto text-gray-300 mb-3' />
							<p className='text-sm font-medium text-foreground mb-1'>Global Search</p>
							<p className='text-xs text-muted-foreground'>Find anything in your campaign</p>
						</div>
					)}
				</div>
			) : results.length > 0 ? (
				// Grouped Search Results
				<div>
					{groupedResults.sessions.length > 0 && (
						<div className='mb-2'>
							<GroupHeader label='Sessions' icon={Calendar} />
							{groupedResults.sessions.map((item) => {
								const idx = results.indexOf(item);
								return (
									<SearchResultItem
										key={item.id}
										item={item}
										isSelected={idx === selectedIndex}
										onSelect={() => handleSelect(item)}
										onHover={() => setSelectedIndex(idx)}
									/>
								);
							})}
						</div>
					)}

					{groupedResults.entities.length > 0 && (
						<div>
							<GroupHeader label='Entities' icon={Database} />
							{groupedResults.entities.map((item) => {
								const idx = results.indexOf(item);
								return (
									<SearchResultItem
										key={item.id}
										item={item}
										isSelected={idx === selectedIndex}
										onSelect={() => handleSelect(item)}
										onHover={() => setSelectedIndex(idx)}
									/>
								);
							})}
						</div>
					)}
				</div>
			) : (
				// No Results
				!isLoading && (
					<div className='text-center py-12 px-4'>
						<p className='text-sm font-medium text-foreground mb-1'>No matches for "{query}"</p>
						<p className='text-xs text-muted-foreground'>Try checking your spelling</p>
					</div>
				)
			)}
		</div>
	);
};
