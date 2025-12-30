import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles, MapPin, Users, Scroll, Swords } from 'lucide-react';
import { clsx } from 'clsx';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { SectionDivider } from '@/shared/components/ui/SectionDivider';

export const LatestSessionCard = ({ session }) => {
	const keyEvents = session.events
		?.filter((e) => {
			const isImportant = [
				'combat',
				'quest_started',
				'quest_progressed',
				'npc_encountered',
				'location_discovered',
			].includes(e.event_type?.toLowerCase());
			return isImportant || (e.relationships && e.relationships.length > 2);
		})
		.slice(0, 5);

	const mentionsByType = session.mentions
		? Object.entries(session.mentions)
				.map(([type, items]) => ({ type, items: items.slice(0, 5), total: items.length }))
				.filter((g) => g.total > 0)
		: [];

	return (
		<div className='bg-background border-2 border-accent/20 rounded-2xl shadow-2xl overflow-hidden hover:border-accent/40 transition-all group'>
			{/* Header Banner */}
			<div className='bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-6 py-4 border-b border-border/50'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='p-2 bg-accent/10 rounded-lg border border-accent/20'>
							<Sparkles size={20} className='text-accent' />
						</div>
						<div>
							<span className='text-xs font-bold uppercase tracking-widest text-accent block mb-0.5'>
								Latest Session
							</span>
							<div className='flex items-center gap-2'>
								<span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border'>
									Session {session.session_number - 1}
								</span>
								{session.session_date && (
									<span className='text-xs text-muted-foreground flex items-center gap-1'>
										<Calendar size={11} strokeWidth={2.5} />
										{session.session_date}
									</span>
								)}
							</div>
						</div>
					</div>
					<Link
						to={`/wiki/session/${session.id}`}
						className='flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm rounded-lg border border-accent/20 transition-all group-hover:translate-x-1'>
						Full Details
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>

			{/* Content */}
			<div className='p-6'>
				{/* Title & Description */}
				<h2 className='text-3xl font-serif font-bold text-foreground mb-3 leading-tight'>{session.name}</h2>
				{session.description && (
					<p className='text-sm text-muted-foreground leading-relaxed mb-6 max-w-3xl'>{session.description}</p>
				)}

				<SectionDivider />

				{/* Two Column Layout */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6'>
					{/* Left: Key Events */}
					<div>
						<h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2'>
							<Swords size={14} className='text-accent' />
							Key Moments
						</h3>
						{keyEvents && keyEvents.length > 0 ? (
							<div className='space-y-3'>
								{keyEvents.map((event) => (
									<div key={event.id} className='flex items-start gap-3 group/item'>
										<div className='shrink-0 w-2 h-2 rounded-full bg-accent/40 mt-2 group-hover/item:bg-accent transition-colors' />
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-semibold text-foreground leading-snug mb-0.5'>{event.title}</p>
											{event.description && (
												<p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
													{event.description}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className='text-xs text-muted-foreground italic'>No events recorded</p>
						)}
					</div>

					{/* Right: Entity Mentions */}
					<div>
						<h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2'>
							<Users size={14} className='text-accent' />
							Entities Encountered
						</h3>
						<div className='space-y-4'>
							{mentionsByType.map(({ type, items, total }) => {
								const config = getEntityConfig(type);
								const Icon = config.icon;

								return (
									<div key={type}>
										<div className='flex items-center gap-2 mb-2'>
											<Icon size={12} className={clsx(config.tailwind.text, 'opacity-70')} strokeWidth={2.5} />
											<span className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
												{config.labelPlural}
											</span>
											<span className='text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border border-border'>
												{total}
											</span>
										</div>
										<div className='flex flex-wrap gap-1.5 ml-5'>
											{items.map((entity, idx) => (
												<Link
													key={`${entity.id}-${idx}`}
													to={`/wiki/${type}/${entity.id}`}
													className={clsx(
														'text-xs font-semibold px-2 py-1 rounded border transition-all hover:shadow-sm',
														config.tailwind.bg,
														config.tailwind.text,
														config.tailwind.border,
														'hover:scale-105'
													)}>
													{entity.name}
												</Link>
											))}
											{total > 5 && <span className='text-xs text-muted-foreground px-2 py-1'>+{total - 5} more</span>}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
