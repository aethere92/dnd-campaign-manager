import { clsx } from 'clsx';
import { getEntityIcon, getEntityStyles } from '../../config/entity';

/**
 * EntityIcon Component
 * Renders an entity icon with optional custom image override
 *
 * @param {string} type - Entity type
 * @param {string} customIconUrl - Optional custom icon URL
 * @param {number} size - Icon size in pixels (default 16)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showBackground - Show colored background (default false)
 * @param {boolean} inline - Use span instead of div for inline contexts (default false)
 */
export default function EntityIcon({
	type,
	customIconUrl = null,
	size = 16,
	className = '',
	showBackground = false,
	inline = false,
	...props
}) {
	const Icon = getEntityIcon(type);
	const styles = getEntityStyles(type);

	// Choose container element (span for inline, div for block)
	const Container = inline ? 'span' : 'div';

	// If custom icon provided, render image
	if (customIconUrl) {
		return (
			<Container
				className={clsx(
					'inline-flex items-center justify-center overflow-hidden',
					showBackground && clsx('rounded-lg border', styles.bg, styles.border),
					className
				)}
				style={{ width: size, height: size }}
				{...props}>
				<img
					src={customIconUrl}
					alt=''
					className='w-full h-full object-cover'
					onError={(e) => {
						// Fallback to icon if image fails
						e.target.style.display = 'none';
						e.target.parentElement.classList.add('fallback-icon');
					}}
				/>
			</Container>
		);
	}

	// Default icon rendering
	if (showBackground) {
		return (
			<Container
				className={clsx(
					'inline-flex items-center justify-center rounded-lg border p-1.5',
					styles.bg,
					styles.border,
					styles.text,
					className
				)}
				{...props}>
				<Icon size={size} strokeWidth={2} />
			</Container>
		);
	}

	return <Icon size={size} className={clsx(styles.text, className)} strokeWidth={2} {...props} />;
}
