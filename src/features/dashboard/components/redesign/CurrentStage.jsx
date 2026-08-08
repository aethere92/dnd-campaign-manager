import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

/**
 * "The Stage" — where the party currently stands, as an establishing shot.
 * Location art fills the right (top on mobile); copy sits on a scrim to the
 * left. The whole panel links to the location's wiki page.
 */
export function CurrentStage({ location }) {
	const routes = useCampaignRoutes();
	const navigate = useNavigate();
	if (!location) return null;

	const art = resolveImageUrl(location.attributes, 'background');
	const type = location.attributes?.type || 'Location';
	const href = routes.wikiEntity('location', location.id);

	// Div + onClick (not a Link) so the SmartMarkdown entity links inside the
	// description don't produce an illegal <a> inside <a>.
	return (
			<div
				role='link'
				tabIndex={0}
				onClick={(e) => {
					if (e.target.closest('a')) return;
					navigate(href);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter') navigate(href);
				}}
				className='group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border bg-card min-h-[240px] hover:shadow-xl transition-shadow cursor-pointer'>
				{/* art — 40% on the right (desktop) / top strip (mobile); tiles with the
				    60% copy column so text never sits over the image */}
				<div className='relative w-full md:w-2/5 md:absolute md:right-0 md:inset-y-0 h-48 md:h-full overflow-hidden'>
					{art ? (
						<div
							className='w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105'
							style={{ backgroundImage: `url("${art}")` }}
						/>
					) : (
						<div className='w-full h-full bg-muted/40 flex items-center justify-center'>
							<MapPin size={44} className='text-muted-foreground/20' />
						</div>
					)}
					{/* soft fade of the art's inner edge into the card */}
					<div className='absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-card via-card/60 to-transparent' />
				</div>

				{/* copy — 60% on the left */}
				<div className='relative z-10 w-full md:w-3/5 p-6 md:p-9 flex flex-col justify-center'>
					<div className='inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] mb-2' style={{ color: 'var(--entity-location, #10b981)' }}>
						<MapPin size={13} />
						The Stage · {type}
					</div>
					<h3 className='font-display text-3xl sm:text-4xl font-bold leading-tight mb-3'>{location.name}</h3>
					{location.description && (
						<div className='text-[15px] text-muted-foreground font-serif leading-relaxed line-clamp-3 max-w-xl'>
							<SmartMarkdown components={{ p: 'span' }} disableTooltips>
								{location.description}
							</SmartMarkdown>
						</div>
					)}
					<span className='inline-flex items-center gap-1.5 mt-5 text-[13px] font-bold uppercase tracking-wider text-primary group-hover:gap-2.5 transition-all'>
						Explore the location <ArrowRight size={14} />
					</span>
				</div>
			</div>
	);
}
