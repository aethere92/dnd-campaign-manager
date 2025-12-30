import { clsx } from 'clsx';
import { getEntityLabel } from '@/domain/entity/config/entityTypes';
import { getEntityStyles } from '@/domain/entity/config/entityStyles';

/**
 * EntityBadge Component
 * Displays a colored type badge for an entity
 *
 * @param {string} type - Entity type
 * @param {string} label - Optional custom label (defaults to type label)
 * @param {string} size - Badge size: 'sm', 'md', 'lg' (default 'md')
 * @param {string} variant - Style variant: 'solid', 'outline', 'subtle' (default 'solid')
 * @param {string} className - Additional CSS classes
 */
export default function EntityBadge({ type, label = null, size = 'md', variant = 'solid', className = '', ...props }) {
	const styles = getEntityStyles(type);
	const displayLabel = label || getEntityLabel(type);

	const sizeClasses = {
		sm: 'text-[9px] px-1.5 py-0.5',
		md: 'text-[10px] px-2 py-0.5',
		lg: 'text-xs px-2.5 py-1',
	};

	const variantClasses = {
		solid: clsx(styles.bg, styles.text, styles.border, 'border'),
		outline: clsx('bg-transparent', styles.text, styles.border, 'border'),
		subtle: clsx(styles.bg, styles.text, 'border-transparent border'),
	};

	return (
		<span
			className={clsx(
				'inline-flex items-center font-bold uppercase tracking-wider rounded shrink-0',
				sizeClasses[size],
				variantClasses[variant],
				className
			)}
			{...props}>
			{displayLabel}
		</span>
	);
}
