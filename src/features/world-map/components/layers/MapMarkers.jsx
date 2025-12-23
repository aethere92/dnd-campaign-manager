import { Marker, Popup } from 'react-leaflet';
import { ArrowRight, MapPin, Skull, Castle, User, Tent, Sparkles } from 'lucide-react';
import { resolveMarkerIcon } from '../../utils/markerUtils';

/**
 * Resolves Lucide Icons for the Popup header based on Category
 */
const getCategoryIcon = (category) => {
	const cat = category?.toLowerCase() || '';
	if (cat.includes('combat') || cat.includes('danger') || cat.includes('encounter')) return Skull;
	if (cat.includes('citie') || cat.includes('town')) return Castle;
	if (cat.includes('npc') || cat.includes('people')) return User;
	if (cat.includes('camp')) return Tent;
	if (cat.includes('magic') || cat.includes('shrine')) return Sparkles;
	return MapPin;
};

export const MapMarkers = ({ markers, onNavigate }) => {
	if (!markers || markers.length === 0) return null;

	return (
		<>
			{markers.map((marker, idx) => {
				const CategoryIcon = getCategoryIcon(marker.category);
				const leafletIcon = resolveMarkerIcon(marker);

				return (
					<Marker key={`${marker.label}-${idx}`} position={marker.position} icon={leafletIcon}>
						<Popup closeButton={true}>
							<div className='flex flex-col w-[260px] font-sans bg-background'>
								{/* Header */}
								<div className='px-4 pt-4 pb-2 pr-7 flex items-start justify-between gap-3'>
									<div>
										<span className='text-[10px] font-bold uppercase tracking-wider text-amber-600/90 block mb-1'>
											{marker.category}
										</span>
										<h3 className='font-serif font-bold text-xl leading-none text-foreground'>{marker.label}</h3>
									</div>
									<div className='shrink-0 p-1.5 rounded-lg shadow-sm border border-amber-200 bg-amber-50 text-amber-700'>
										<CategoryIcon size={16} strokeWidth={2} />
									</div>
								</div>

								<div className='h-px w-full bg-border/50 my-1' />

								{/* Description */}
								<div className='px-4 py-2'>
									{marker.description ? (
										<p className='text-xs text-gray-600 leading-relaxed line-clamp-6'>{marker.description}</p>
									) : (
										<p className='text-xs text-gray-400 italic'>No details available.</p>
									)}
								</div>

								{/* Navigation Link (Map-to-Map) */}
								{marker.mapLink && (
									<div className='mt-2 bg-muted/50 p-2 border-t border-border flex justify-end rounded-b-lg'>
										<button
											onClick={() => onNavigate(marker.mapLink)}
											className='text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors uppercase tracking-wide cursor-pointer'>
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
