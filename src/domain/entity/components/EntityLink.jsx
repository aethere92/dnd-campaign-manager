import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { useTooltip } from '@/features/smart-tooltip/TooltipContext';
import { getEntityStyles } from '@/domain/entity/config/entityStyles';
import EntityIcon from './EntityIcon';

/**
 * EntityLink
 *
 * @param {'inline'|'card'|'row'} [variant='card']
 *   - `inline` — dotted-underline link for use inside running prose
 *   - `card`   — padded, entity-tinted block
 *   - `row`    — full-width list row with a slot on the right for a badge.
 *                Callers pass that badge as `trailing`.
 *
 * The `row` variant exists because four call sites (EntitySidebar,
 * SessionMentions, CharacterSidebar, RelationshipNetwork) were each overriding
 * the `card` styling with ~10 `!important` utilities to reshape it into a list
 * row. Declaring it as a variant removes ~40 `!important`s.
 *
 * `inline` is still accepted as a boolean prop for backwards compatibility.
 */
export default function EntityLink({
	id,
	type,
	children,
	customIconUrl = null,
	showIcon = true,
	className = '',
	inline = false,
	variant,
	trailing = null,
	...props
}) {
	const navigate = useNavigate();
	const { openTooltip, closeTooltip } = useTooltip();
	const styles = getEntityStyles(type);
	const campaignRoutes = useCampaignRoutes();
	const targetPath = campaignRoutes.wikiEntity(type, id);

	// `inline` boolean takes precedence so existing call sites keep working.
	const resolvedVariant = inline ? 'inline' : variant || 'card';

	const handleMouseEnter = (e) => {
		// Desktop only: Hover to open
		if (window.matchMedia('(hover: hover)').matches) {
			openTooltip(e, id, type);
		}
	};

	const handleMouseLeave = () => {
		if (window.matchMedia('(hover: hover)').matches) {
			closeTooltip();
		}
	};

	const handleClick = (e) => {
		e.preventDefault();

		if (window.matchMedia('(hover: hover)').matches) {
			// Desktop: Click to navigate
			navigate(targetPath);
			closeTooltip();
		} else {
			// Mobile: Tap to open tooltip (Sticky mode = true)
			openTooltip(e, id, type, true);
		}
	};

	const commonProps = {
		// Hash prefix: the app uses HashRouter, so a bare /c/... path 404s on
		// ctrl+click / "open in new tab", which bypass onClick.
		href: `#${targetPath}`,
		onClick: handleClick,
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
		...props,
	};

	if (resolvedVariant === 'inline') {
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

	if (resolvedVariant === 'row') {
		return (
			<a
				className={clsx(
					'group flex w-full items-center justify-between gap-2 p-2 rounded-lg border no-underline',
					'bg-card/60 border-border cursor-pointer transition-all',
					'hover:border-primary/40 hover:shadow-sm hover:bg-card',
					className
				)}
				{...commonProps}>
				<span className='flex items-center gap-2.5 flex-1 min-w-0'>
					{showIcon && (
						<EntityIcon
							type={type}
							customIconUrl={customIconUrl}
							size={16}
							className='opacity-80 group-hover:opacity-100 transition-opacity shrink-0'
						/>
					)}
					<span className='text-xs font-semibold text-card-foreground truncate group-hover:text-foreground transition-colors'>
						{children}
					</span>
				</span>
				{trailing}
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
