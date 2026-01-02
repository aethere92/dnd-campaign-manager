import { Link } from 'react-router-dom';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import EntityBadge from '@/domain/entity/components/EntityBadge';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser'; // Added missing import

export const EntityPosterCard = ({ entity, config }) => {
	const attributes = parseAttributes(entity.attributes);

	const imageUrl =
		resolveImageUrl(attributes, ['portrait', 'image']) ||
		resolveImageUrl(attributes, 'background') ||
		resolveImageUrl(attributes, 'icon');

	// Fallback Description Logic
	const description =
		entity.description ||
		getAttributeValue(attributes, ['summary', 'narrative', 'background', 'bio']) ||
		'No description available.';

	// Smart Subtitle for Characters
	const role = getAttributeValue(attributes, ['class', 'role', 'occupation', 'type']);
	const level = getAttributeValue(attributes, ['level']);

	let subtitle = role || entity.type;
	if (level && role) {
		subtitle = `Lvl ${level} ${role}`;
	} else if (level) {
		subtitle = `Level ${level}`;
	}

	// FIX: Changed outer wrapper from <Link> to <div> to prevent <a> nesting errors
	return (
		<div className='group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-[380px]'>
			{/* FIX: Stretched Link - This makes the whole card clickable without nesting tags */}
			<Link
				to={`/wiki/${entity.type}/${entity.id}`}
				className='absolute inset-0 z-0'
				aria-label={`View ${entity.name}`}
			/>

			{/* 1. Image Area */}
			{/* Added pointer-events-none so clicks fall through to the link, or you can leave it interactive if needed */}
			<div className='relative h-[60%] bg-muted overflow-hidden'>
				{imageUrl ? (
					<>
						<img
							src={imageUrl}
							alt={entity.name}
							className='w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105'
							loading='lazy'
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300' />
					</>
				) : (
					<div className='w-full h-full flex flex-col items-center justify-center bg-muted/50 p-6 text-center'>
						<config.icon size={48} className='text-muted-foreground/30 mb-2' strokeWidth={1} />
						<span className='text-xs font-serif text-muted-foreground/50 uppercase tracking-widest'>No Image</span>
					</div>
				)}

				{/* Floating Badge */}
				<div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
					<EntityBadge type={entity.type} size='sm' variant='solid' className='shadow-lg' />
				</div>
			</div>

			{/* 2. Content Area */}
			{/* Relative z-10 places text above the stretched link if you want text selection, 
                but usually for a card link we want the click to work everywhere. 
                Using pointer-events-none on the container allows clicks to pass to the Link below. */}
			<div className='flex-1 p-4 flex flex-col bg-card relative z-10 border-t border-border/50 pointer-events-none'>
				<div className='mb-2'>
					<h3 className='font-serif font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1'>
						{entity.name}
					</h3>
					<p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate mt-1'>
						{subtitle}
					</p>
				</div>

				<div className='text-xs text-muted-foreground/80 leading-relaxed line-clamp-4 overflow-hidden text-ellipsis'>
					{/* SmartMarkdown can now safely render links because we are inside a div, not an <a> */}
					<SmartMarkdown components={{ p: 'span' }}>{description}</SmartMarkdown>
				</div>
			</div>
		</div>
	);
};
