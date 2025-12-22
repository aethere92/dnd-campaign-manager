import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { getEntityConfig } from '../../../config/entity';
import { getAttributeValue } from '../../../utils/entity/attributeParser';
import { ArrowRight } from 'lucide-react';
import { useSmartPosition } from '../useSmartPosition';
import { resolveImageUrl, parseAttributes } from '../../../utils/image/imageResolver';

export const TooltipCard = ({ data, type, id, position, isLoading, onMouseEnter, onMouseLeave }) => {
	const navigate = useNavigate();
	const config = getEntityConfig(type);
	const Icon = config.icon;

	// Use smart positioning hook
	const { style, tooltipRef, isPositioned } = useSmartPosition(position, true);

	const handleClick = (e) => {
		e.stopPropagation();
		navigate(`/wiki/${type}/${id}`);
		onMouseLeave && onMouseLeave();
	};

	if (isLoading) {
		return (
			<div
				ref={tooltipRef}
				style={style}
				className='bg-background p-3 rounded-lg shadow-xl border border-border text-xs text-gray-400'>
				Loading info...
			</div>
		);
	}

	if (!data) return null;

	const attributes = parseAttributes(data.attributes);
	const image = resolveImageUrl(attributes, 'background');
	const status = getAttributeValue(attributes, ['status', 'disposition']);
	const race = getAttributeValue(attributes, ['race', 'ancestry']);
	const classJob = getAttributeValue(attributes, ['class', 'occupation', 'role']);

	const tags = [status, race, classJob].filter(Boolean).join(' • ');

	return (
		<div
			ref={tooltipRef}
			style={style}
			onClick={handleClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={clsx(
				'bg-background rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/10 cursor-pointer group',
				'hover:ring-amber-500/50 transition-shadow'
			)}>
			{/* IMAGE BANNER */}
			{image ? (
				<div className='h-24 w-full relative bg-gray-900 overflow-hidden'>
					<img
						src={image}
						alt={data.name}
						onError={(e) => {
							e.target.style.display = 'none';
							e.target.parentElement.classList.add('bg-amber-900');
						}}
						className='w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-500'
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-background to-transparent' />
				</div>
			) : (
				<div
					className={clsx(
						'h-1.5 w-full',
						config.tailwind.bg.replace(
							'bg-',
							'bg-gradient-to-r from-transparent via-current to-transparent opacity-50'
						),
						config.tailwind.text
					)}
				/>
			)}

			<div className={clsx('px-4', image ? '-mt-6 relative z-10' : 'pt-3')}>
				<div className='flex items-start justify-between'>
					<div>
						<span
							className={clsx(
								'text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5 block',
								config.tailwind.text
							)}>
							{data.type}
						</span>
						<h3 className='font-serif font-bold text-lg leading-none text-foreground group-hover:text-amber-700 transition-colors'>
							{data.name}
						</h3>
					</div>
					<div
						className={clsx(
							'p-1.5 rounded-lg shadow-sm border bg-background',
							config.tailwind.border,
							config.tailwind.text
						)}>
						<Icon size={16} />
					</div>
				</div>
				{tags && <p className='text-[11px] font-medium text-gray-500 mt-1.5 pb-2 border-b border-border/50'>{tags}</p>}
			</div>

			<div className='p-4 pt-3'>
				<p className='text-xs text-gray-600 overflow-auto h-full max-h-32 leading-relaxed'>
					{data.description || 'No overview available.'}
				</p>
			</div>

			<div className='bg-muted/50 p-2 border-t border-border flex justify-end'>
				<span className='text-[10px] font-semibold text-gray-400 flex items-center gap-1 group-hover:text-amber-600 transition-colors'>
					View Details <ArrowRight size={10} />
				</span>
			</div>
		</div>
	);
};
