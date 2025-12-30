import { createPortal } from 'react-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { SearchFooter } from './SearchFooter';

export const SearchModal = ({ vm, inputRef }) => {
	return createPortal(
		// Fixed inset-0 for full screen coverage on mobile
		<div className='fixed inset-0 z-[100] flex flex-col lg:items-center lg:pt-[15vh] px-0 lg:px-4'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-background/95 lg:bg-black/60 lg:backdrop-blur-sm transition-all'
				onClick={vm.closeSearch}
			/>

			{/* Search Panel */}
			<div className='relative w-full lg:max-w-2xl bg-background lg:rounded-xl shadow-2xl border-b lg:border border-border overflow-hidden flex flex-col h-full lg:h-auto lg:max-h-[70vh] animate-in fade-in slide-in-from-bottom-2 lg:slide-in-from-top-4 duration-200'>
				{/* Search Input Area */}
				<div className='flex items-center gap-3 p-4 border-b border-border bg-background shrink-0'>
					<button onClick={vm.closeSearch} className='lg:hidden p-1 -ml-1 text-muted-foreground'>
						<X size={20} />
					</button>
					<Search size={18} className='text-gray-400 shrink-0 hidden lg:block' />

					<input
						ref={inputRef}
						type='text'
						value={vm.query}
						onChange={(e) => {
							vm.setQuery(e.target.value);
							vm.setSelectedIndex(0);
						}}
						placeholder='Search sessions, entities, lore...'
						className='flex-1 bg-transparent text-base lg:text-sm text-foreground placeholder:text-gray-400 outline-none h-10 lg:h-auto'
					/>

					{vm.isLoading && <Loader2 size={16} className='animate-spin text-amber-600' />}

					{vm.query && !vm.isLoading && (
						<button
							onClick={() => {
								vm.setQuery('');
								inputRef.current?.focus();
							}}
							className='p-1 text-gray-400 hover:text-foreground hover:bg-muted rounded transition-colors'>
							<X size={16} />
						</button>
					)}
					<kbd className='hidden lg:inline-block px-2 py-1 text-[10px] font-semibold text-gray-400 bg-muted border border-border rounded'>
						ESC
					</kbd>
				</div>

				{/* Results Area - Flex 1 for mobile scrolling */}
				<div className='flex-1 overflow-y-auto bg-muted/10 custom-scrollbar'>
					<SearchResults vm={vm} />
				</div>

				{/* Footer (Desktop Only) */}
				<div className='hidden lg:block'>
					<SearchFooter />
				</div>
			</div>
		</div>,
		document.body
	);
};
