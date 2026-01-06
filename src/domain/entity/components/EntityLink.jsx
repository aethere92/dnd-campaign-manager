import { useNavigate } from 'react-router-dom';
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

	const handleMouseEnter = (e) => {
		// Desktop only: Hover to open
		if (window.matchMedia('(hover: hover)').matches) {
			openTooltip(e, id, type);
		}
	};

	// FIX: Guard closeTooltip so mobile touch emulation doesn't auto-close it
	const handleMouseLeave = () => {
		if (window.matchMedia('(hover: hover)').matches) {
			closeTooltip();
		}
	};

	const handleClick = (e) => {
		e.preventDefault();

		if (window.matchMedia('(hover: hover)').matches) {
			// Desktop: Click to navigate
			navigate(`/wiki/${type}/${id}`);
			closeTooltip();
		} else {
			// Mobile: Tap to open tooltip (Sticky mode = true)
			openTooltip(e, id, type, true);
		}
	};

	const commonProps = {
		href: `/wiki/${type}/${id}`,
		onClick: handleClick,
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave, // Use the guarded handler
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
