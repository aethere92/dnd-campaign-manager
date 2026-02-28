import { createPortal } from 'react-dom';
import { Search, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { SearchResults } from './SearchResults';
import { SearchFooter } from './SearchFooter';

export const SearchModal = ({ vm, inputRef }) => {
	const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

	const handleSubmit = (e) => {
		e.preventDefault();
		if (vm.aiMode && vm.query.trim().length >= 2) {
			vm.submitAiSearch();
		}
	};

	return createPortal(
		<div className='fixed inset-0 z-[100] flex flex-col lg:items-center lg:pt-[15vh] px-0 lg:px-4'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-background/95 lg:bg-black/60 lg:backdrop-blur-sm transition-all'
				onClick={vm.closeSearch}
			/>

			{/* Search Panel */}
			<div className='relative w-full lg:max-w-2xl bg-background lg:rounded-xl shadow-2xl border-b lg:border border-border overflow-hidden flex flex-col h-full lg:h-auto lg:max-h-[70vh] animate-in fade-in slide-in-from-bottom-2 lg:slide-in-from-top-4 duration-200'>
				{/* Search Input Area */}
				<form onSubmit={handleSubmit} className='flex items-center gap-3 p-4 border-b border-border bg-background shrink-0'>
					<button type='button' onClick={vm.closeSearch} className='lg:hidden p-1 -ml-1 text-muted-foreground'>
						<X size={20} />
					</button>
					<Search size={18} className='text-muted-foreground/70 shrink-0 hidden lg:block' />

					<input
						ref={inputRef}
						type='text'
						value={vm.query}
						onChange={(e) => {
							vm.setQuery(e.target.value);
							vm.setSelectedIndex(0);
						}}
						placeholder={vm.aiMode ? 'Ask anything about your campaign...' : 'Search sessions, entities, lore...'}
						className='flex-1 bg-transparent text-base lg:text-sm text-foreground placeholder:text-muted-foreground/70 outline-none h-10 lg:h-auto'
					/>

					{vm.aiLoading && <Loader2 size={16} className='animate-spin text-purple-400' />}

					{!vm.aiMode && vm.isLoading && <Loader2 size={16} className='animate-spin text-amber-600' />}

					{vm.query && !vm.isLoading && !vm.aiLoading && (
						<button
							type='button'
							onClick={() => {
								vm.setQuery('');
								inputRef.current?.focus();
							}}
							className='p-1 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded transition-colors'>
							<X size={16} />
						</button>
					)}

					{/* AI Submit Button */}
					{vm.aiMode && vm.query.trim().length >= 2 && !vm.aiLoading && (
						<button
							type='submit'
							className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all'>
							<ArrowRight size={13} />
							<span className='hidden lg:inline'>Ask</span>
						</button>
					)}

					{/* AI Toggle */}
					{hasApiKey && (
						<button
							type='button'
							onClick={vm.toggleAiMode}
							title={vm.aiMode ? 'Switch to keyword search' : 'Switch to AI search'}
							className={clsx(
								'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border',
								vm.aiMode
									? 'bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25'
									: 'bg-muted/50 text-muted-foreground/70 border-border hover:bg-muted hover:text-foreground'
							)}>
							<Sparkles size={13} />
							<span className='hidden lg:inline'>AI</span>
						</button>
					)}

					<kbd className='hidden lg:inline-block px-2 py-1 text-[10px] font-semibold text-muted-foreground/70 bg-muted border border-border rounded'>
						ESC
					</kbd>
				</form>

				{/* Results Area */}
				<div className='flex-1 overflow-y-auto bg-muted/10 custom-scrollbar'>
					<SearchResults vm={vm} />
				</div>

				{/* Footer (Desktop Only) */}
				<div className='hidden lg:block'>
					<SearchFooter aiMode={vm.aiMode} />
				</div>
			</div>
		</div>,
		document.body
	);
};
