import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import { getStatusInfo } from '@/domain/entity/utils/statusUtils';

export const EntityGridCard = ({ entity, config }) => {
	const attributes = parseAttributes(entity.attributes);
	const imageUrl = resolveImageUrl(attributes, 'background') || resolveImageUrl(attributes, 'icon');
	const status = getStatusInfo(entity);

	const isActorOrQuest = ['npc', 'character', 'faction', 'quest'].includes(entity.type);
	const hasMeaningfulStatus = status.isDead || status.isFailed || status.rank === 1 || status.rank === 3;
	const showStatus = isActorOrQuest && hasMeaningfulStatus;

	let statusBorderClass = 'border-l-transparent';
	if (showStatus) {
		if (status.isDead || status.isFailed) statusBorderClass = 'border-l-red-500';
		else if (status.rank === 3) statusBorderClass = 'border-l-red-600';
		else if (status.rank === 1) statusBorderClass = 'border-l-emerald-500';
	}

	return (
		<Link
			to={`/wiki/${entity.type}/${entity.id}`}
			className={clsx(
				'group flex bg-background border border-border rounded-lg overflow-hidden transition-all duration-200',
				entity.footerLabel ? 'h-28' : 'h-24',
				'hover:shadow-md hover:bg-muted/10',
				showStatus ? `border-l-[3px] ${statusBorderClass}` : 'border-l'
			)}>
			{/* Left: Image */}
			<div className='w-24 shrink-0 relative bg-muted/30 border-r border-border/50'>
				{imageUrl ? (
					<>
						<img
							src={imageUrl}
							alt={entity.name}
							className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
						/>
						<div className='absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors' />
					</>
				) : (
					<div className='w-full h-full flex items-center justify-center bg-muted'>
						<config.icon size={28} className='text-muted-foreground/70' strokeWidth={1.5} />
					</div>
				)}
			</div>

			{/* Right: Content */}
			<div
				className={clsx(
					'flex-1 px-3 py-2 flex flex-col min-w-0',
					// FIX: If footer exists, space between. If not, center vertically.
					entity.footerLabel ? 'justify-between' : 'justify-center'
				)}>
				<div>
					<div className='flex items-center justify-between gap-2'>
						<h3 className='font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate'>
							{entity.name}
						</h3>
					</div>

					<div className='text-[11px] text-muted-foreground/80 leading-snug mt-1 line-clamp-3'>
						{entity.description || <span className='opacity-50 italic'>No details available.</span>}
					</div>
				</div>

				{entity.footerLabel && (
					<div className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-auto pt-2 truncate border-t border-border/40'>
						{entity.footerLabel}
					</div>
				)}
			</div>
		</Link>
	);
};
