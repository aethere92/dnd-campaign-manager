import { clsx } from 'clsx';

export const SearchResultItem = ({ item, isSelected, onSelect, onHover }) => {
	return (
		<button
			onClick={onSelect}
			onMouseEnter={onHover}
			className={clsx(
				'w-full flex items-start gap-3 px-4 py-2.5 transition-colors text-left',
				isSelected ? 'bg-amber-50' : 'hover:bg-muted'
			)}>
			<div
				className={clsx(
					'shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center',
					item.theme.bg,
					item.theme.border,
					item.theme.text
				)}>
				<item.icon size={16} />
			</div>
			<div className='flex-1 min-w-0'>
				<div className='flex items-center gap-2 mb-0.5'>
					<span className='text-sm font-semibold text-foreground truncate'>{item.name}</span>
					<span className='shrink-0 text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-muted px-1.5 py-0.5 rounded'>
						{item.type}
					</span>
				</div>
				{item.description && <p className='text-xs text-gray-600 line-clamp-2 leading-relaxed'>{item.description}</p>}
			</div>
			{isSelected && (
				<kbd className='shrink-0 text-[10px] font-semibold text-gray-400 bg-muted px-2 py-1 rounded border border-border'>
					↵
				</kbd>
			)}
		</button>
	);
};
