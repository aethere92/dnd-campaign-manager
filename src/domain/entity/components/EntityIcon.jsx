import { clsx } from 'clsx';
import { getEntityIcon } from '@/domain/entity/config/entityIcons';
import { getEntityStyles } from '@/domain/entity/config/entityStyles';

/**
 * EntityIcon Component
 * Renders an entity icon with optional custom image override
 * STRICTLY uses <span> to ensure hydration safety inside <p> tags.
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

	// FIX: Always use 'span' to avoid "div descendant of p" hydration errors
	const Container = 'span';

	// 1. Custom Image Case
	if (customIconUrl) {
		return (
			<Container
				className={clsx(
					'inline-flex items-center justify-center overflow-hidden shrink-0 select-none bg-muted',
					showBackground && clsx('rounded-lg border', styles.bg, styles.border),
					className
				)}
				style={{ width: size, height: size }}
				{...props}>
				<img
					src={customIconUrl}
					alt=''
					className='w-full h-full object-cover'
					draggable={false}
					onError={(e) => {
						e.target.style.display = 'none';
						e.target.parentElement.classList.add('fallback-icon');
					}}
				/>
			</Container>
		);
	}

	// 2. Background/Frame Case
	if (showBackground) {
		return (
			<Container
				className={clsx(
					'inline-flex items-center justify-center rounded-lg border p-1.5 shrink-0 select-none',
					styles.bg,
					styles.border,
					styles.text,
					className
				)}
				style={{ width: size, height: size }}
				{...props}>
				<Icon size={size * 0.75} strokeWidth={2} />
			</Container>
		);
	}

	// 3. Simple Icon Case (SVG is safe in <p>)
	return <Icon size={size} className={clsx(styles.text, className)} strokeWidth={2} {...props} />;
}
