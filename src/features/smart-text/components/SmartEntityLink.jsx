import { useNavigate } from 'react-router-dom';
import { useTooltip } from '../../smart-tooltip/TooltipContext';
import { getEntityConfig } from '../../../config/entityConfig';
import { useEntityIndex } from '../useEntityIndex';
import { clsx } from 'clsx';

export const SmartEntityLink = ({ id, type, children }) => {
	const navigate = useNavigate();
	const { openTooltip, closeTooltip } = useTooltip();

	const config = getEntityConfig(type);
	const DefaultIcon = config.icon;

	const entityIndex = useEntityIndex();
	const entity = entityIndex.find((e) => e.id === id);
	const customIconUrl = entity?.iconUrl;

	const handleMouseEnter = (e) => {
		openTooltip(e, id, type);
	};

	const handleClick = (e) => {
		const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
		if (isMobile) {
			e.preventDefault();
			e.stopPropagation();
			openTooltip(e, id, type, true);
		} else {
			e.preventDefault();
			navigate(`/wiki/${type}/${id}`);
			closeTooltip();
		}
	};

	return (
		<a
			href={`/wiki/${type}/${id}`}
			onClick={handleClick}
			className={clsx(
				// CHANGED:
				// 1. 'align-middle' instead of 'align-baseline' helps the flex container sit better in prose
				// 2. 'inline-flex' + 'items-center' keeps the icon and text centered relative to each other
				'inline-flex items-center gap-1.5 font-semibold no-underline transition-colors border-b border-dashed border-transparent hover:border-current cursor-pointer align-middle',
				config.tailwind.text,
				config.tailwind.hover
			)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={closeTooltip}>
			{customIconUrl ? (
				<img
					src={customIconUrl}
					alt=''
					// TWEAK: Added 'shadow-sm' and ensured strict sizing
					className='!m-0 !w-4 !h-4 rounded-[3px] object-cover bg-black/10 shadow-sm self-center'
				/>
			) : (
				DefaultIcon && <DefaultIcon className='w-3.5 h-3.5 self-center opacity-80' strokeWidth={2.5} />
			)}
			<span className='leading-snug'>{children}</span>
		</a>
	);
};
