import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTooltip } from '../../features/smart-tooltip/TooltipContext';
import { getEntityStyles } from '../../config/entity';
import EntityIcon from './EntityIcon';

/**
 * EntityLink Component
 * Smart navigation link with tooltip support and consistent styling
 *
 * @param {string} id - Entity ID
 * @param {string} type - Entity type
 * @param {string} children - Link text
 * @param {string} customIconUrl - Optional custom icon
 * @param {boolean} showIcon - Show icon before text (default true)
 * @param {string} className - Additional CSS classes
 * @param {boolean} inline - Inline mode (minimal styling, default false)
 */
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
		openTooltip(e, id, type);
	};

	const handleClick = (e) => {
		e.preventDefault();

		// Mobile: Open tooltip instead of navigating
		const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
		if (isMobile) {
			e.stopPropagation();
			openTooltip(e, id, type, true);
		} else {
			navigate(`/wiki/${type}/${id}`);
			closeTooltip();
		}
	};

	// Inline mode: minimal styling for use within text
	if (inline) {
		return (
			<a
				href={`/wiki/${type}/${id}`}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={closeTooltip}
				className={clsx(
					'inline-flex items-center gap-1.5 font-semibold no-underline transition-colors',
					'border-b border-dashed border-transparent hover:border-current cursor-pointer align-middle',
					styles.text,
					styles.hover,
					className
				)}
				{...props}>
				{showIcon && (
					<EntityIcon
						type={type}
						customIconUrl={customIconUrl}
						size={14}
						inline={true}
						className='self-center opacity-80'
					/>
				)}
				<span className='leading-snug'>{children}</span>
			</a>
		);
	}

	// Standard mode: card/button styling
	return (
		<a
			href={`/wiki/${type}/${id}`}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={closeTooltip}
			className={clsx(
				'flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer',
				'hover:shadow-sm',
				styles.bg,
				styles.hover,
				styles.border,
				'border',
				className
			)}
			{...props}>
			{showIcon && <EntityIcon type={type} customIconUrl={customIconUrl} size={18} inline={false} />}
			<span className={clsx('font-semibold text-sm', styles.text)}>{children}</span>
		</a>
	);
}
