import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CornerDownRight, Users, MapPin, Scroll, Swords, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { EntityGridCard } from './EntityGridCard';
import { EntityPosterCard } from './EntityPosterCard';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { SectionDivider } from '@/shared/components/ui/SectionDivider';
import { HighlightBadge } from '@/shared/components/ui/HighlightBadge';
import { clsx } from 'clsx';

// --- SUB-COMPONENT: ARC HERO ---
const ArcHero = ({ title, description, type, order, stats, isSessionGroup }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const formattedOrder = order && order < 999 ? `Arc ${String(order).padStart(2, '0')}` : null;

	// LOGIC:
	// 1. If it's a Session Group, NEVER truncate (always show full narrative context).
	// 2. If it's NOT a Session Group (e.g. Locations folder), check if > 300 chars.
	const shouldTruncate = !isSessionGroup && description && description.length > 300;

	return (
		<div className='flex flex-col gap-3 mb-8 items-center'>
			{/* 1. Arc Number / Arc Type */}
			<div className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60'>
				{formattedOrder && (
					<span className='flex items-center gap-1'>
						<Hash size={10} />
						{formattedOrder}
					</span>
				)}
				{formattedOrder && type && <span>•</span>}
				{type && <span className='text-primary/80'>{type}</span>}
			</div>

			{/* 2. Arc Name */}
			<h2 className='text-3xl md:text-4xl font-serif font-bold text-foreground text-center max-w-4xl'>{title}</h2>

			{/* 3. Arc Description */}
			<div className='max-w-3xl text-center mx-auto'>
				<div
					className={clsx(
						'text-sm text-muted-foreground leading-relaxed',
						// Only apply line-clamp if we are allowed to truncate and haven't expanded yet
						shouldTruncate && !isExpanded ? 'line-clamp-3 overflow-hidden' : ''
					)}>
					<SmartMarkdown components={{ p: 'span' }}>{description || 'No description available.'}</SmartMarkdown>
				</div>

				{/* Toggle Button (Only shows for non-sessions with long text) */}
				{shouldTruncate && (
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className='inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-widest text-primary/80 hover:text-primary transition-colors'>
						{isExpanded ? (
							<>
								Read Less <ChevronUp size={12} />
							</>
						) : (
							<>
								Read More <ChevronDown size={12} />
							</>
						)}
					</button>
				)}
			</div>

			{/* 4. Arc Highlights */}
			{stats && (stats.npcs > 0 || stats.locations > 0 || stats.quests > 0 || stats.encounters > 0) && (
				<div className='flex flex-wrap justify-center gap-4 mt-2'>
					<HighlightBadge icon={Users} count={stats.npcs} label='NPCs' />
					<HighlightBadge icon={MapPin} count={stats.locations} label='Locations' />
					<HighlightBadge icon={Scroll} count={stats.quests} label='Quests' />
					<HighlightBadge icon={Swords} count={stats.encounters} label='Encounters' />
				</div>
			)}
		</div>
	);
};

// --- SUB-COMPONENT: STANDARD HEADER ---
const StandardHeader = ({ title, parentTitle, link, count }) => (
	<div className='mb-4'>
		<div className='flex items-center gap-2 border-b border-border/60 pb-2'>
			{parentTitle && (
				<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest'>
					{parentTitle}
					<CornerDownRight size={10} className='translate-y-px text-muted-foreground' />
				</div>
			)}

			<h2 className='text-lg font-bold font-serif text-foreground flex items-center gap-2'>
				{title || 'General'}
				{link && (
					<Link
						to={link}
						className='text-muted-foreground/50 hover:text-primary transition-colors'
						title={`View ${title}`}>
						<ArrowRight size={14} />
					</Link>
				)}
			</h2>

			<span className='text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto'>
				{count}
			</span>
		</div>
	</div>
);

// --- MAIN COMPONENT ---
export const Swimlane = ({ title, description, items, config, context, type, stats, order, parentTitle, link }) => {
	if (!items || items.length === 0) return null;

	const visualTypes = ['character'];
	const usePoster = items.length > 0 && visualTypes.includes(items[0].type);

	const isArc = !!description || !!type;

	// Determine if this is a Session Group (e.g. Narrative Arc) vs a Category Group (e.g. Locations)
	const isSessionGroup = items[0].type === 'session';

	return (
		<div className='animate-in fade-in slide-in-from-bottom-3 duration-500'>
			{/* HEADER SECTION */}
			{isArc ? (
				<ArcHero
					title={title}
					description={description} // Pass full description
					type={type}
					order={order}
					stats={stats}
					isSessionGroup={isSessionGroup} // Pass flag to control truncation
				/>
			) : (
				<StandardHeader title={title} parentTitle={parentTitle} link={link} count={items.length} />
			)}

			{/* CONTENT SECTION */}
			<div className='max-w-7xl mx-auto pb-4'>
				<div className='flex flex-wrap justify-center gap-4'>
					{items.map((entity) => (
						<div
							key={entity.id}
							className={clsx(
								'w-full',
								// Adjust width: Posters are narrower but taller, Grid cards are wider
								usePoster ? 'sm:w-[240px]' : 'sm:w-[320px]',
								'grow-0 shrink-0'
							)}>
							{usePoster ? (
								<EntityPosterCard entity={entity} config={config} />
							) : (
								<EntityGridCard entity={entity} config={config} context={context} />
							)}
						</div>
					))}
				</div>
			</div>

			{/* SEPARATOR */}
			{isArc && <SectionDivider />}
		</div>
	);
};
