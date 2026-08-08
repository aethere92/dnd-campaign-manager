import { Search, Clock, Loader2 } from 'lucide-react';
import { SearchResultItem } from './SearchResultItem';
import { AnswerCard } from './AnswerCard';

export const SearchResults = ({ vm }) => {
	const {
		query,
		results,
		isLoading,
		recentSearches,
		selectedIndex,
		setSelectedIndex,
		handleSelect,
		clearRecent,
		isQuestion,
		answer,
		openSession,
		openEntity,
	} = vm;

	// Recognised question → structured answer instead of a result list.
	if (query.trim() !== '' && isQuestion) {
		if (isLoading && !answer) {
			return (
				<div className='flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground'>
					<Loader2 size={16} className='animate-spin' /> Looking that up…
				</div>
			);
		}
		return (
			<div className='pb-4'>
				<AnswerCard answer={answer} onOpenSession={openSession} onOpenEntity={openEntity} />
			</div>
		);
	}

	if (query.trim() === '') {
		return (
			<div className='pb-4'>
				<div className='p-4'>
					{recentSearches.length > 0 ? (
						<>
							<div className='flex items-center justify-between mb-3'>
								<h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground/70'>
									Recent Searches
								</h3>
								<button
									onClick={clearRecent}
									className='text-xs text-muted-foreground/70 hover:text-foreground transition-colors'>
									Clear
								</button>
							</div>
							<div className='space-y-1'>
								{recentSearches.map((item) => (
									<button
										key={item.id}
										onClick={() => handleSelect(item)}
										className='w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left group'>
										<Clock
											size={14}
											className='mt-1 text-muted-foreground/40 group-hover:text-primary transition-colors'
										/>
										<span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
											{item.name}
										</span>
									</button>
								))}
							</div>
						</>
					) : (
						<div className='text-center py-12 opacity-60'>
							<Search size={40} className='mx-auto text-muted-foreground/40 mb-3' />
							<p className='text-sm font-medium text-foreground mb-1'>Global Search</p>
							<p className='text-xs text-muted-foreground'>Find anything in your campaign</p>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className='pb-4'>
			{/* Synthesized summary line — reads as if the search reasoned about the
			    query, but it's just counts of what the keyword match returned. */}
			{!isLoading && results.length > 0 && (
				<p className='px-4 pt-3 pb-1 text-xs text-muted-foreground'>
					Found <span className='font-semibold text-foreground'>{results.length}</span>{' '}
					{results.length === 1 ? 'result' : 'results'} for “{query.trim()}”
				</p>
			)}

			{/* One flat list in relevance order — no per-type grouping, so the best
			    match (e.g. the character you searched for) leads regardless of type.
			    Each row still shows its type badge for context. */}
			{results.map((item, idx) => (
				<SearchResultItem
					key={item.id}
					item={item}
					query={query}
					isSelected={idx === selectedIndex}
					onSelect={() => handleSelect(item)}
					onHover={() => setSelectedIndex(idx)}
				/>
			))}

			{!isLoading && results.length === 0 && (
				<div className='text-center py-12 px-4'>
					<p className='text-sm font-medium text-foreground mb-1'>No matches for "{query}"</p>
					<p className='text-xs text-muted-foreground'>Try checking your spelling</p>
				</div>
			)}
		</div>
	);
};
