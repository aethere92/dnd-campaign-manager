import { clsx } from 'clsx';

export const TocItem = ({ item, isActive, onClick }) => {
	// Calculate indent based on depth (Depth 1 = 0px, Depth 2 = 12px, etc.)
	const indentClass = item.depth > 1 ? (item.depth === 2 ? 'ml-3' : 'ml-6') : '';

	return (
		<button
			onClick={() => onClick(item.id)}
			className={clsx(
				'group flex items-start text-left w-full py-1.5 transition-all duration-200 border-l-[3px] px-4',
				isActive
					? 'border-primary text-primary font-bold bg-primary/10'
					: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
			)}>
			<span
				className={clsx(
					'text-[13px] leading-snug transition-opacity',
					indentClass,
					// Fade sub-items slightly for hierarchy
					item.depth > 1 && 'opacity-90',
					// Bold top-level items for emphasis
					item.depth === 1 && 'font-medium uppercase tracking-tight text-foreground/80'
				)}>
				{item.text}
			</span>
		</button>
	);
};
