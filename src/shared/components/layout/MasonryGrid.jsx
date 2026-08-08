import { clsx } from 'clsx';

/**
 * CSS-column masonry layout. Children should carry `break-inside-avoid` so cards
 * aren't split across columns.
 *
 * @param {1|2|3} [columns=3] - Column count at the largest breakpoint
 * @param {'sm'|'md'|'lg'} [gap='md']
 */
const COLUMN_CLASSES = {
	1: 'columns-1',
	2: 'columns-1 md:columns-2',
	3: 'columns-1 md:columns-2 xl:columns-3',
};

const GAP_CLASSES = {
	sm: 'gap-3 space-y-3',
	md: 'gap-4 space-y-4',
	lg: 'gap-6 space-y-6',
};

export default function MasonryGrid({ children, columns = 3, gap = 'md', className = '' }) {
	return (
		<div className={clsx(COLUMN_CLASSES[columns] || COLUMN_CLASSES[3], GAP_CLASSES[gap] || GAP_CLASSES.md, className)}>
			{children}
		</div>
	);
}
