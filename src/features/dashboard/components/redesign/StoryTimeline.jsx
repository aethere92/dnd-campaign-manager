import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, ChevronRight, Archive } from 'lucide-react';
import { clsx } from 'clsx';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { formatDate } from '@/shared/utils/textUtils';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { SectionHeading } from './SectionHeading';

/**
 * "The Story So Far" — the current arc as a glowing ley-line of session beats,
 * with earlier arcs collapsed beneath as an archive. Session/arc data mirrors
 * dashboardService: currentArc = { data, latestSession, sessions }, plus otherArcs.
 */
export function StoryTimeline({ currentArc, otherArcs = [] }) {
	const routes = useCampaignRoutes();
	const arc = currentArc?.data;
	const latestId = currentArc?.latestSession?.id;

	// Sessions newest-first within the current arc.
	const sessions = [...(currentArc?.sessions || [])].sort(
		(a, b) => (b.session_number || 0) - (a.session_number || 0)
	);

	if (!arc && !sessions.length) return null;

	return (
		<>
			<SectionHeading icon={GitBranch} eyebrow='The Story So Far' title='Every session becomes history' />

			<div className='mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto'>
				{/* left: current arc identity */}
				<div className='lg:pt-2'>
					{arc && (
						<>
							<div className='text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-1'>
								{arc.order ? `Arc ${arc.order}` : 'Current Arc'} · Active
							</div>
							<h3 className='font-display text-2xl sm:text-3xl font-bold leading-tight mb-3'>{arc.title}</h3>
							{arc.description && (
								<div className='text-[15px] text-muted-foreground font-serif leading-relaxed line-clamp-5'>
									<SmartMarkdown components={{ p: 'span' }} disableTooltips>
										{arc.description}
									</SmartMarkdown>
								</div>
							)}
						</>
					)}

					{otherArcs.length > 0 && <ArchiveList arcs={otherArcs} />}
				</div>

				{/* right: session ley-line */}
				<div className='dash-ley relative pl-9'>
					{sessions.map((s) => {
						const isNow = s.id === latestId;
						return (
							<Link
								key={s.id}
								to={routes.wikiEntity('session', s.id)}
								className='group relative flex items-baseline gap-3.5 py-3 transition-transform hover:translate-x-1.5'>
								<span
									className={clsx(
										'absolute -left-[34px] top-[19px] w-2.5 h-2.5 rounded-full border-2 transition-all',
										isNow
											? 'bg-primary border-primary shadow-[0_0_14px_var(--primary)]'
											: 'bg-card border-border group-hover:border-primary group-hover:bg-primary'
									)}
								/>
								<span
									className={clsx(
										'font-display font-bold text-lg w-7 shrink-0',
										isNow ? 'text-primary' : 'text-muted-foreground'
									)}>
									{s.session_number}
								</span>
								<span className='min-w-0 flex-1'>
									<span className='block font-display font-bold text-base leading-tight group-hover:text-primary transition-colors truncate'>
										{s.title}
									</span>
									{s.subtitle && (
										<span className='block text-[13px] text-muted-foreground truncate'>{s.subtitle}</span>
									)}
								</span>
								<span className='shrink-0 text-[11px] text-muted-foreground whitespace-nowrap'>
									{formatDate(s.session_date)}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</>
	);
}

function ArchiveList({ arcs }) {
	const [open, setOpen] = useState(false);
	const routes = useCampaignRoutes();

	return (
		<div className='mt-8 pt-6 border-t border-border'>
			<button
				onClick={() => setOpen((v) => !v)}
				className='flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors'>
				<Archive size={13} />
				The Archive · {arcs.length} earlier {arcs.length === 1 ? 'arc' : 'arcs'}
				<ChevronRight size={14} className={clsx('transition-transform', open && 'rotate-90')} />
			</button>

			{open && (
				<div className='mt-4 space-y-2.5'>
					{arcs.map((a) => (
						<div key={a.id} className='flex items-baseline justify-between gap-3'>
							<div className='min-w-0'>
								<div className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
									Arc {a.order}
								</div>
								<Link
									to={a.sessions?.[0] ? routes.wikiEntity('session', a.sessions[0].id) : '#'}
									className='font-display font-bold text-[15px] hover:text-primary transition-colors truncate block'>
									{a.title}
								</Link>
							</div>
							<span className='shrink-0 text-[12px] text-muted-foreground whitespace-nowrap'>
								{a.sessions?.length || 0} {a.sessions?.length === 1 ? 'session' : 'sessions'}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
