import { clsx } from 'clsx';

export const TocItem = ({ item, isActive, onClick }) => {
	return (
		<a
			href={`#${item.id}`}
			onClick={(e) => {
				e.preventDefault();
				onClick(item.id);
			}}
			className={clsx(
				'group flex w-full items-center py-2 transition-all duration-200',
				// THE LUCIDE TRICK:
				// 1. -ml-px pulls this item 1px to the left, exactly on top of the parent's border.
				// 2. border-l-2 gives us the colored bar.
				'-ml-px border-l-2 pl-4',

				// Depth Indentation (Lucide flattens depth usually, but we keep indentation)
				item.depth === 2 ? 'pl-4' : item.depth === 3 ? 'pl-8' : '',

				isActive
					? 'border-primary text-primary font-medium'
					: 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
			)}>
			<span className='text-sm truncate'>{item.text}</span>
		</a>
	);
};
