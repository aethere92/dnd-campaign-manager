import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import { getStatusInfo } from '@/domain/entity/utils/statusUtils';
import { getEntityDescription } from '@/domain/entity/utils/entityUtils';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import EntityIcon from '@/domain/entity/components/EntityIcon';

// Helper: Description Extraction
const resolveDescription = (entity, attributes) => {
	if (entity.description && entity.description.length > 0) return entity.description;
	const text = getAttributeValue(attributes, [
		'summary',
		'narrative',
		'background',
		'description',
		'short_description',
		'appearance',
		'history',
		'role',
	]);
	return text || null;
};

export const EntityGridCard = ({ entity, config, context }) => {
	const attributes = parseAttributes(entity.attributes);
	const imageUrl = resolveImageUrl(attributes, 'background') || resolveImageUrl(attributes, 'icon');
	const status = getStatusInfo(entity);
	const description = resolveDescription(entity, attributes);

	// Status Logic
	const isActorOrQuest = ['npc', 'character', 'faction', 'quest'].includes(entity.type);
	const hasMeaningfulStatus = status.isDead || status.isFailed || status.rank === 1 || status.rank === 3;
	const showStatus = isActorOrQuest && hasMeaningfulStatus;

	// Determine Status Color
	let statusBorderClass = 'border-l-transparent';
	if (showStatus) {
		if (status.isDead || status.isFailed) statusBorderClass = 'border-l-red-500';
		else if (status.rank === 3) statusBorderClass = 'border-l-red-600';
		else if (status.rank === 1) statusBorderClass = 'border-l-emerald-500';
	}

	// Metadata Logic
	let footerLabel = entity.type;
	if (context === 'geo') {
		const role = getAttributeValue(attributes, ['role', 'occupation', 'class', 'monster type']);
		footerLabel = role || entity.type;
	} else {
		footerLabel = entity.meta?.region || entity.type;
	}

	return (
		<Link
			to={`/wiki/${entity.type}/${entity.id}`}
			className={clsx(
				'group flex bg-background border border-border rounded-lg overflow-hidden transition-all duration-200 h-15',
				'hover:border-accent/50 hover:shadow-sm hover:bg-muted/10',
				showStatus ? `border-l-[3px] ${statusBorderClass}` : 'border-l'
			)}>
			{/* Left: Image/Icon Square */}
			<div className='w-15 shrink-0 relative bg-muted/30 border-r border-border/50'>
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
					<div className='w-full h-full flex items-center justify-center bg-stone-100'>
						<config.icon size={28} className='text-stone-400/70 mix-blend-multiply' strokeWidth={1.5} />
					</div>
				)}
			</div>

			{/* Right: Content */}
			<div className='flex-1 px-3 py-2 flex flex-col min-w-0 justify-center'>
				<div className='flex items-center justify-between gap-2'>
					<h3 className='font-serif font-bold text-sm text-foreground group-hover:text-accent transition-colors truncate'>
						{entity.name}
					</h3>
				</div>

				<div className='text-[11px] text-muted-foreground truncate opacity-80 mt-0.5'>
					{description || <span className='opacity-50 italic'>{footerLabel}</span>}
				</div>
			</div>
		</Link>
	);
};
