import { useNavigate } from 'react-router-dom';
import { useRef, useCallback } from 'react'; // ADDED
import { clsx } from 'clsx';
import { useTooltip } from '@/features/smart-tooltip/TooltipContext';
import { getEntityStyles } from '@/domain/entity/config/entityStyles';
import EntityIcon from './EntityIcon';

export default function EntityLink({
	id,
	type,
	children,
	customIconUrl = null,
	showIcon = true,
	className = '',
	inline = false,
	...props
}) {
	const navigate = useNavigate();
	const { openTooltip, closeTooltip } = useTooltip();
	const styles = getEntityStyles(type);

	// --- IMPROVEMENT #4: Long Press Logic ---
	const pressTimer = useRef(null);
	const isLongPress = useRef(false);

	const handleTouchStart = (e) => {
		isLongPress.current = false;
		pressTimer.current = setTimeout(() => {
			isLongPress.current = true;
			// Open Tooltip on long press position
			openTooltip(e, id, type, true);
		}, 500); // 500ms threshold
	};

	const handleTouchEnd = (e) => {
		if (pressTimer.current) {
			clearTimeout(pressTimer.current);
		}
		// If it wasn't a long press, treat as click (Navigate)
		if (!isLongPress.current) {
			navigate(`/wiki/${type}/${id}`);
			closeTooltip();
		}
		// Prevent ghost clicks if it was a long press
		if (isLongPress.current && e.cancelable) {
			e.preventDefault();
		}
	};

	const handleTouchMove = () => {
		// Cancel everything if user scrolls
		if (pressTimer.current) {
			clearTimeout(pressTimer.current);
			isLongPress.current = true; // Treat as "handled" so we don't navigate
		}
	};
	// ----------------------------------------

	const handleMouseEnter = (e) => {
		// Desktop only
		if (window.matchMedia('(hover: hover)').matches) {
			openTooltip(e, id, type);
		}
	};

	const handleClick = (e) => {
		e.preventDefault();
		// Desktop click handling (Touch handled via TouchEnd)
		if (window.matchMedia('(hover: hover)').matches) {
			navigate(`/wiki/${type}/${id}`);
			closeTooltip();
		}
	};

	const commonProps = {
		href: `/wiki/${type}/${id}`,
		onClick: handleClick,
		onMouseEnter: handleMouseEnter,
		onMouseLeave: closeTooltip,
		// Mobile Events
		onTouchStart: handleTouchStart,
		onTouchEnd: handleTouchEnd,
		onTouchMove: handleTouchMove,
		...props,
	};

	if (inline) {
		return (
			<a
				className={clsx(
					'inline-flex items-center gap-1.5 font-semibold no-underline transition-colors',
					'border-b border-dashed border-transparent hover:border-current cursor-pointer align-middle',
					styles.text,
					styles.hover,
					className
				)}
				{...commonProps}>
				{showIcon && (
					<EntityIcon
						type={type}
						customIconUrl={customIconUrl}
						size={14}
						inline={true}
						className='self-center rounded-full'
					/>
				)}
				{children}
			</a>
		);
	}

	return (
		<a
			className={clsx(
				'flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer',
				'hover:shadow-sm',
				styles.bg,
				styles.hover,
				styles.border,
				'border',
				className
			)}
			{...commonProps}>
			{showIcon && <EntityIcon type={type} customIconUrl={customIconUrl} size={18} inline={false} />}
			<span className={clsx('font-semibold text-sm', styles.text)}>{children}</span>
		</a>
	);
}
