import { createPortal } from 'react-dom'; // 1. Import createPortal
import { Search, X } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { SearchFooter } from './SearchFooter';

export const SearchModal = ({ vm, inputRef }) => {
	// 2. Wrap the entire modal in createPortal, targeting document.body
	return createPortal(
		<div className='fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/60 backdrop-blur-sm'
				onClick={() => {
					vm.setIsOpen(false);
					vm.setQuery('');
				}}
			/>

			{/* Search Panel */}
			<div className='relative w-full max-w-2xl bg-background rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
				{/* Search Input */}
				<div className='flex items-center gap-3 p-4 border-b border-border'>
					<Search size={18} className='text-gray-400 shrink-0' />
					<input
						ref={inputRef}
						type='text'
						value={vm.query}
						onChange={(e) => {
							vm.setQuery(e.target.value);
							vm.setSelectedIndex(0);
						}}
						placeholder='Search sessions, characters, locations, and more...'
						className='flex-1 bg-transparent text-sm text-foreground placeholder:text-gray-400 outline-none'
					/>
					{vm.query && (
						<button
							onClick={() => {
								vm.setQuery('');
								inputRef.current?.focus();
							}}
							className='p-1 text-gray-400 hover:text-foreground hover:bg-muted rounded transition-colors'>
							<X size={16} />
						</button>
					)}
					<kbd className='hidden sm:inline-block px-2 py-1 text-[10px] font-semibold text-gray-400 bg-muted border border-border rounded'>
						ESC
					</kbd>
				</div>

				{/* Results Area */}
				<SearchResults vm={vm} />

				{/* Footer with keyboard shortcuts */}
				<SearchFooter />
			</div>
		</div>,
		document.body // The target container
	);
};
