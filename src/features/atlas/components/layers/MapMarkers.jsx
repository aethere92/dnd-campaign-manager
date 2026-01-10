import { Marker, Popup } from 'react-leaflet';
import { ArrowRight, BookOpen, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAtlas } from '../../context/AtlasContext'; // Import the new Context
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';
import { useEntityIndex } from '@/features/smart-text/useEntityIndex';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

export const MapMarkers = ({ markers }) => {
	const navigate = useNavigate();
	const { map: entityMap } = useEntityIndex();

	// Get navigation function directly from context
	const { navigateToMap } = useAtlas();

	if (!markers || markers.length === 0) return null;

	return (
		<>
			{markers.map((marker, idx) => {
				// Generate Leaflet Icon
				const leafletIcon = resolveMarkerIcon(marker);

				// Attempt to link Marker -> Entity (by Name)
				const entityMatch = Array.from(entityMap.values()).find(
					(e) => e.name.toLowerCase() === marker.label.toLowerCase()
				);

				const entityAttrs = entityMatch ? parseAttributes(entityMatch.attributes) : {};

				// Prepare Display Data (Merge Marker Data with Entity Data)
				const displayData = {
					title: marker.label,
					category:
						marker.category && marker.category !== 'default'
							? marker.category
							: entityMatch
							? entityMatch.type
							: 'Point of Interest',
					description: marker.description
						? marker.description
						: entityMatch
						? getAttributeValue(entityAttrs, ['summary', 'narrative']) || entityMatch.description
						: null,
					image: entityMatch ? resolveImageUrl(entityAttrs, 'background') : null,
				};

				const entityConfig = entityMatch ? getEntityConfig(entityMatch.type) : null;

				// --- Handlers ---

				const handleWikiNav = (e) => {
					e.stopPropagation();
					if (entityMatch) {
						navigate(`/wiki/${entityMatch.type}/${entityMatch.id}`);
					}
				};

				const handleMapNav = (e) => {
					e.stopPropagation();
					if (marker.mapLink) {
						navigateToMap(marker.mapLink);
					}
				};

				return (
					<Marker
						// Use a stable key if possible, falling back to label+index
						key={marker.id || `${marker.label}-${idx}`}
						position={marker.position}
						icon={leafletIcon}>
						<Popup className='custom-popup-clean' closeButton={false}>
							<div className='flex flex-col w-full font-sans bg-background rounded-lg overflow-hidden border border-border shadow-sm'>
								{/* Header Image */}
								{displayData.image && (
									<div className='h-24 w-full relative bg-muted'>
										<img src={displayData.image} alt={displayData.title} className='w-full h-full object-cover' />
										<div className='absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 via-30% to-transparent pointer-events-none' />
									</div>
								)}

								{/* Content Body */}
								<div className={clsx('px-4 pb-3', displayData.image ? 'pt-2 -mt-8 relative z-10' : 'pt-4')}>
									<div className='flex items-start justify-between gap-2'>
										<div>
											<span
												className={clsx(
													'text-[10px] font-bold uppercase tracking-wider block mb-0.5',
													entityConfig ? entityConfig.tailwind.text : 'text-muted-foreground'
												)}>
												{displayData.category}
											</span>
											<h3 className='font-serif font-bold text-lg leading-tight text-foreground drop-shadow-sm'>
												{displayData.title}
											</h3>
										</div>
										{entityConfig && (
											<div
												className={clsx(
													'p-1.5 rounded-md border shrink-0 bg-background/80 backdrop-blur-sm',
													entityConfig.tailwind.border,
													entityConfig.tailwind.text
												)}>
												<entityConfig.icon size={14} />
											</div>
										)}
									</div>

									<div className='h-px w-full bg-border/50 my-3' />

									<div className='text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto custom-scrollbar'>
										{displayData.description || <span className='italic opacity-70'>No details available.</span>}
									</div>
								</div>

								{/* Actions Footer */}
								{(marker.mapLink || entityMatch) && (
									<div className='bg-muted/50 p-2 border-t border-border flex flex-col gap-1'>
										{/* Action: Enter Sub-Map */}
										{marker.mapLink && (
											<button
												onClick={handleMapNav}
												className='w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-primary/10 text-primary transition-colors text-xs font-bold uppercase tracking-wide group'>
												<span className='flex items-center gap-2'>
													<MapIcon size={12} /> Enter Location
												</span>
												<ArrowRight size={12} className='group-hover:translate-x-1 transition-transform' />
											</button>
										)}

										{/* Action: Open Wiki */}
										{entityMatch && (
											<button
												onClick={handleWikiNav}
												className='w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold group'>
												<span className='flex items-center gap-2'>
													<BookOpen size={12} /> View Encyclopedia
												</span>
												<ArrowRight size={12} className='opacity-0 group-hover:opacity-100 transition-opacity' />
											</button>
										)}
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
