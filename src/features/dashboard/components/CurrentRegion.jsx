import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const CurrentRegion = ({ location }) => {
	// Above the early return: hooks must run unconditionally on every render.
	const routes = useCampaignRoutes();

	if (!location) return null;

	const bgImage = location.attributes?.background_image || location.attributes?.header_image;
	const type = location.attributes?.type || 'Location';

	return (
		<div className='w-full'>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center'>
				Current Stage
			</h4>

			<div className='relative overflow-hidden bg-card border border-border rounded-xl group hover:shadow-md transition-all duration-500 flex flex-col md:flex-row min-h-[220px]'>
				{/* Image Section (Right on desktop, Top on mobile) */}
				<div className='w-full md:w-2/5 md:absolute md:right-0 md:top-0 md:bottom-0 h-48 md:h-full relative overflow-hidden shrink-0'>
					{bgImage ? (
						<img
							src={bgImage}
							alt={location.name}
							className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90'
						/>
					) : (
						<div className='w-full h-full bg-muted/40 flex items-center justify-center'>
							<MapPin size={48} className='text-muted-foreground/20' />
						</div>
					)}
					{/* Gradient Fade to text area */}
					<div className='absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-card/50 to-card' />
				</div>

				{/* Text Section (Left) */}
				<div className='relative z-10 w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center'>
					<div className='flex items-center gap-2 mb-2'>
						<MapPin size={14} className='text-emerald-500' />
						<span className='text-[10px] uppercase font-bold tracking-widest text-emerald-500/80'>{type}</span>
					</div>

					<h3 className='text-3xl font-serif font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors'>
						{location.name}
					</h3>

					<div className='text-sm text-muted-foreground line-clamp-3 md:line-clamp-2 mb-4 leading-relaxed max-w-xl'>
						<SmartMarkdown components={{ p: 'span' }}>
							{location.description || 'No geographic records available for this location.'}
						</SmartMarkdown>
					</div>

					<Link
						to={routes.wikiEntity('location', location.id)}
						className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors w-fit'>
						View Location <ArrowRight size={14} />
					</Link>
				</div>
			</div>
		</div>
	);
};
