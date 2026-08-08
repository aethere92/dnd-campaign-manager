import { clsx } from 'clsx';
import { highlightSegments } from '@/features/search/utils/rankResults';

/** Render text with the matched query terms emphasised. */
const Highlighted = ({ text, query }) => (
	<>
		{highlightSegments(text, query).map((seg, i) =>
			seg.match ? (
				<mark key={i} className='bg-amber-500/30 text-foreground rounded-[2px] px-0.5'>
					{seg.text}
				</mark>
			) : (
				<span key={i}>{seg.text}</span>
			)
		)}
	</>
);

export const SearchResultItem = ({ item, isSelected, onSelect, onHover, query = '' }) => {
	return (
		<button
			onClick={onSelect}
			onMouseEnter={onHover}
			className={clsx(
				'w-full flex items-start gap-3 px-4 py-2.5 transition-colors text-left',
				isSelected ? 'bg-amber-500/10' : 'hover:bg-muted'
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
					<span className='text-sm font-semibold text-foreground truncate'>
						<Highlighted text={item.name} query={query} />
					</span>
					<span className='shrink-0 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded'>
						{item.type}
					</span>
				</div>
				{item.description && (
					<p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
						<Highlighted text={item.description} query={query} />
					</p>
				)}
			</div>
			{isSelected && (
				<kbd className='shrink-0 text-[10px] font-semibold text-muted-foreground/70 bg-muted px-2 py-1 rounded border border-border'>
					↵
				</kbd>
			)}
		</button>
	);
};
