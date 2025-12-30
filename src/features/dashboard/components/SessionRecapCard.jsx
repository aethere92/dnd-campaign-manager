import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Swords, Users, MapPin, Scroll } from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';

export const SessionRecapCard = ({ session, featured = false }) => {
	// Extract highlights (events with most mentions or specific types)
	const highlights = session.events
		?.filter((e) => {
			const hasMentions = e.relationships?.length > 0;
			const isImportant = ['combat', 'quest_started', 'quest_progressed', 'npc_encountered'].includes(
				e.event_type?.toLowerCase()
			);
			return hasMentions || isImportant;
		})
		.slice(0, 3);

	// Count mentions by type
	const mentionCounts = session.mentions
		? Object.entries(session.mentions).reduce((acc, [type, items]) => {
				if (items.length > 0) {
					acc.push({ type, count: items.length, items: items.slice(0, 3) });
				}
				return acc;
		  }, [])
		: [];

	return (
		<Link
			to={`/wiki/session/${session.id}`}
			className={clsx(
				'block group transition-all',
				featured
					? 'bg-background border-2 border-accent/30 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-accent/50'
					: 'bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:border-accent/30'
			)}>
			{/* Header */}
			<div className='flex items-start justify-between mb-4'>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 mb-1'>
						<span
							className={clsx(
								'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
								featured
									? 'bg-accent/10 text-accent border border-accent/30'
									: 'bg-muted text-muted-foreground border border-border'
							)}>
							Session {session.session_number - 1}
						</span>
						{session.session_date && (
							<span className='text-xs text-muted-foreground flex items-center gap-1'>
								<Calendar size={10} />
								{session.session_date}
							</span>
						)}
					</div>
					<h3
						className={clsx(
							'font-serif font-bold group-hover:text-accent transition-colors',
							featured ? 'text-2xl mb-2' : 'text-lg mb-1'
						)}>
						{session.name}
					</h3>
					{session.description && (
						<p className={clsx('text-muted-foreground leading-relaxed', featured ? 'text-sm' : 'text-xs line-clamp-2')}>
							{session.description}
						</p>
					)}
				</div>
				<ArrowRight
					size={featured ? 20 : 16}
					className='shrink-0 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all'
				/>
			</div>

			{/* Highlights */}
			{highlights && highlights.length > 0 && (
				<div className='mb-4'>
					<h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1'>
						<Swords size={10} /> Key Moments
					</h4>
					<div className='space-y-1.5'>
						{highlights.map((event) => (
							<div key={event.id} className='flex items-start gap-2 text-xs'>
								<span className='text-accent mt-0.5'>•</span>
								<span className='text-foreground leading-snug'>{event.title}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Mentions Summary */}
			{mentionCounts.length > 0 && (
				<div className='flex flex-wrap gap-3 pt-3 border-t border-border/50'>
					{mentionCounts.map(({ type, count, items }) => {
						const config = getEntityConfig(type);
						const Icon = config.icon;

						return (
							<div key={type} className='flex items-center gap-2'>
								<div
									className={clsx(
										'flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border',
										config.tailwind.bg,
										config.tailwind.text,
										config.tailwind.border
									)}>
									<Icon size={10} />
									<span className='font-bold'>{count}</span>
									<span className='opacity-70'>{config.labelPlural}</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Link>
	);
};
