import { Marker, Popup } from 'react-leaflet';
import { ArrowRight } from 'lucide-react';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';

export const MapMarkers = ({ markers, onNavigate }) => {
	if (!markers || markers.length === 0) return null;

	return (
		<>
			{markers.map((marker, idx) => {
				// markerUtils now does the heavy lifting
				const leafletIcon = resolveMarkerIcon(marker);

				return (
					<Marker key={`${marker.label}-${idx}`} position={marker.position} icon={leafletIcon}>
						<Popup closeButton={true}>
							<div className='flex flex-col w-[260px] font-sans bg-background'>
								<div className='px-4 pt-4 pb-2 pr-7'>
									<span className='text-[10px] font-bold uppercase tracking-wider text-accent block mb-1'>
										{marker.category}
									</span>
									<h3 className='font-serif font-bold text-xl leading-none text-foreground'>{marker.label}</h3>
								</div>

								<div className='h-px w-full bg-border/50 my-1' />

								<div className='px-4 py-2'>
									{marker.description ? (
										<p className='text-xs text-muted-foreground leading-relaxed line-clamp-6'>{marker.description}</p>
									) : (
										<p className='text-xs text-muted-foreground italic'>No details available.</p>
									)}
								</div>

								{marker.mapLink && (
									<div className='mt-2 bg-muted/50 p-2 border-t border-border flex justify-end rounded-b-lg'>
										<button
											onClick={() => onNavigate(marker.mapLink)}
											className='text-[10px] font-bold text-accent hover:underline flex items-center gap-1 transition-colors uppercase tracking-wide cursor-pointer'>
											Enter Location <ArrowRight size={10} />
										</button>
									</div>
								)}
							</div>
						</Popup>
					</Marker>
				);
			})}
		</>
	);
};
