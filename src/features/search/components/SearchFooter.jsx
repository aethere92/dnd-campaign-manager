export const SearchFooter = () => {
	return (
		<div className='flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground'>
			<div className='flex items-center gap-4'>
				<span className='flex items-center gap-1.5'>
					<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↑</kbd>
					<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↓</kbd>
					<span>navigate</span>
				</span>
				<span className='flex items-center gap-1.5'>
					<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>↵</kbd>
					<span>select</span>
				</span>
			</div>
			<span className='flex items-center gap-1.5'>
				<kbd className='px-1.5 py-0.5 bg-background border border-border rounded font-semibold'>ESC</kbd>
				<span>close</span>
			</span>
		</div>
	);
};
