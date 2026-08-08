import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Calendar, BookOpen } from 'lucide-react';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { formatDate } from '@/shared/utils/textUtils';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

/**
 * The campaign hero + "Previously…" recap.
 *
 * Full-bleed key art (within the content area — the app has a sidebar, so this
 * is NOT viewport-width) melting into the page, a serif display title, and a
 * glass recap panel that answers "where were we?". The whole recap links to the
 * latest session; there are no decorative tabs — every affordance navigates
 * somewhere real.
 *
 * Deliberately not 100svh: the mobile shell has a sticky header, so the hero is
 * bounded and the recap stacks *below* the title on small screens (no overlap).
 */
export function HeroChronicle({ campaign, counts, latestArc, currentRegion }) {
	const routes = useCampaignRoutes();
	const navigate = useNavigate();

	const heroArt = resolveImageUrl(campaign?.attributes, 'background');
	const latestSession = latestArc?.latestSession;
	const sessionHref = latestSession ? routes.wikiEntity('session', latestSession.id) : null;

	return (
		<section className='relative w-full overflow-hidden'>
			{/* key art */}
			{heroArt && <div className='dash-hero-art' style={{ backgroundImage: `url("${heroArt}")` }} />}
			{/* biome glow + vignette */}
			<div className='dash-biome' style={{ '--dash-biome': 'var(--primary)' }} />

			<div className='relative z-10 px-4 sm:px-8 pt-16 sm:pt-24 pb-10 max-w-4xl mx-auto text-center flex flex-col items-center'>
				<div className='inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-primary mb-5'>
					<Sparkles size={13} />
					<span>
						The Chronicle
						{counts?.sessions ? ` · ${counts.sessions} sessions` : ''}
					</span>
				</div>

				<h1 className='font-display text-[2.5rem] sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-foreground text-balance'>
					{campaign?.name || 'Campaign'}
				</h1>

				{campaign?.description && (
					<div className='mt-5 max-w-xl text-base sm:text-lg text-muted-foreground font-serif italic leading-relaxed'>
						<SmartMarkdown components={{ p: 'span' }} disableTooltips>
							{campaign.description}
						</SmartMarkdown>
					</div>
				)}

				{/* Recap panel */}
				{latestSession && (
					<div className='mt-9 w-full max-w-2xl text-left'>
						<div className='rounded-2xl border border-border bg-card/70 backdrop-blur-md shadow-xl overflow-hidden'>
							<div className='flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/40'>
								<BookOpen size={15} className='text-primary shrink-0' />
								<span className='min-w-0 flex-1 font-display font-bold text-sm sm:text-base truncate'>
									{latestSession.title}
								</span>
								<span className='ml-auto shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1'>
									Latest session
								</span>
							</div>

							{/* div + onClick (not Link) so the entity links SmartMarkdown emits
							    aren't illegally nested inside an <a>. */}
							<div
								role='link'
								tabIndex={0}
								onClick={(e) => {
									if (e.target.closest('a')) return;
									navigate(sessionHref);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') navigate(sessionHref);
								}}
								className='block px-5 py-4 hover:bg-primary/5 transition-colors group cursor-pointer'>
								<div className='text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-2'>
									Previously · Session {latestSession.session_number}
								</div>
								<div className='font-serif text-[15px] leading-relaxed text-foreground/90 line-clamp-4'>
									<SmartMarkdown components={{ p: 'span' }} disableTooltips>
										{latestSession.narrative || 'No summary recorded for this session yet.'}
									</SmartMarkdown>
								</div>
								<span className='inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-primary group-hover:gap-2.5 transition-all'>
									Read full log <ArrowRight size={14} />
								</span>
							</div>
						</div>

						{/* context row: where + when */}
						<div className='flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 px-1 text-[13px] text-muted-foreground'>
							{currentRegion && (
								<span className='inline-flex items-center gap-1.5'>
									<MapPin size={13} className='text-primary' />
									The party stands in
									<Link
										to={routes.wikiEntity('location', currentRegion.id)}
										className='font-semibold text-foreground hover:text-primary transition-colors'>
										{currentRegion.name}
									</Link>
								</span>
							)}
							{latestSession.session_date && (
								<span className='inline-flex items-center gap-1.5'>
									<Calendar size={13} className='text-primary' />
									{formatDate(latestSession.session_date)}
								</span>
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
