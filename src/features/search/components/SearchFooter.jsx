import { Sparkles } from 'lucide-react';

export const SearchFooter = ({ aiMode }) => {
	return (
		<div className='flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground'>
			<div className='flex items-center gap-4'>
				{aiMode ? (
					<span className='flex items-center gap-1.5'>
						<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↵</kbd>
						<span>ask AI</span>
					</span>
				) : (
					<>
						<span className='flex items-center gap-1.5'>
							<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↑</kbd>
							<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↓</kbd>
							<span>navigate</span>
						</span>
						<span className='flex items-center gap-1.5'>
							<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↵</kbd>
							<span>select</span>
						</span>
					</>
				)}
			</div>
			<div className='flex items-center gap-4'>
				{aiMode && (
					<span className='flex items-center gap-1.5 text-purple-400'>
						<Sparkles size={10} />
						<span>Gemini Flash</span>
					</span>
				)}
				<span className='flex items-center gap-1.5'>
					<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>ESC</kbd>
					<span>close</span>
				</span>
			</div>
		</div>
	);
};
