import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Maximize, Minimize, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { useEntityIndex } from '@/features/smart-text/useEntityIndex';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

const MapController = ({ bounds, activeFullscreen }) => {
	const map = useMap();
	useEffect(() => {
		if (bounds && map) {
			const timer = setTimeout(() => {
				map.invalidateSize({ animate: true });
				map.fitBounds(bounds, { padding: [20, 20] });
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [map, bounds, activeFullscreen]);
	return null;
};

export const EntityMiniMap = ({ imageUrl, markers = [] }) => {
	const [dimensions, setDimensions] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
	const containerRef = useRef(null);
	const navigate = useNavigate();
	const { map: entityMap } = useEntityIndex();

	const activeFullscreen = isFullscreen || isPseudoFullscreen;

	useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	}, []);

	useEffect(() => {
		const handleEsc = (e) => {
			if (e.key === 'Escape' && isPseudoFullscreen) setIsPseudoFullscreen(false);
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [isPseudoFullscreen]);

	useEffect(() => {
		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			const w = img.width;
			const h = img.height;
			const southWest = [-h, 0];
			const northEast = [0, w];
			setDimensions(L.latLngBounds(southWest, northEast));
			setLoading(false);
		};
	}, [imageUrl]);

	const toggleFullscreen = (e) => {
		e.stopPropagation();
		if (!containerRef.current) return;
		const supportsNative =
			document.fullscreenEnabled || document.webkitFullscreenEnabled || containerRef.current.requestFullscreen;
		if (supportsNative) {
			if (!document.fullscreenElement) {
				containerRef.current.requestFullscreen().catch(() => setIsPseudoFullscreen(true));
			} else {
				document.exitFullscreen();
			}
		} else {
			setIsPseudoFullscreen(!isPseudoFullscreen);
		}
	};

	if (loading)
		return (
			<div className='h-64 w-full bg-muted rounded-xl flex items-center justify-center border border-border mb-8'>
				<LoadingSpinner text='Generating tactical view...' size='sm' />
			</div>
		);

	return (
		<div
			className={clsx('mb-10 space-y-3 group', isPseudoFullscreen && 'fixed inset-0 z-[9999] m-0! bg-background')}
			ref={containerRef}>
			{!activeFullscreen && (
				<div className='flex items-center justify-between px-1'>
					<h3 className='font-serif text-lg mt-0 font-bold text-foreground mb-3 flex items-center gap-2'>
						<MapIcon size={16} className='text-accent' /> Map
					</h3>
				</div>
			)}

			<div
				className={clsx(
					'w-full overflow-hidden relative z-0 transition-all duration-300',
					activeFullscreen ? 'h-screen rounded-none border-0' : 'h-96 rounded-xl border border-border shadow-sm'
				)}>
				<MapContainer
					crs={L.CRS.Simple}
					bounds={dimensions}
					zoom={-2}
					minZoom={-3}
					scrollWheelZoom={true}
					attributionControl={false}
					style={{
						height: '100%',
						width: '100%',
						backgroundColor: 'var(--background)',
						backgroundImage:
							'radial-gradient(circle at center, var(--border) 1px, transparent 1px), radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
						backgroundSize: '40px 40px, 20px 20px',
						backgroundPosition: '0 0, 20px 20px',
					}}>
					<MapController bounds={dimensions} activeFullscreen={activeFullscreen} />
					<ImageOverlay url={imageUrl} bounds={dimensions} />

					{markers.map((marker, idx) => {
						const entityMatch = Array.from(entityMap.values()).find(
							(e) => e.name.toLowerCase() === marker.label.toLowerCase()
						);
						const entityAttrs = entityMatch ? parseAttributes(entityMatch.attributes) : {};

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

						const handleWikiNav = (e) => {
							e.stopPropagation();
							if (entityMatch) {
								navigate(`/wiki/${entityMatch.type}/${entityMatch.id}`);
							}
						};

						return (
							<Marker
								key={`${marker.label}-${idx}`}
								position={[marker.lat, marker.lng]}
								icon={resolveMarkerIcon(marker)}>
								{marker.label && (
									<Popup className='custom-popup-clean' closeButton={false}>
										<div className='flex flex-col w-full font-sans bg-background rounded-lg overflow-hidden border border-border shadow-sm'>
											{displayData.image && (
												<div className='h-24 w-full relative bg-muted'>
													<img
														src={displayData.image}
														alt={displayData.title}
														className='w-full h-full object-cover m-0!'
													/>
													{/* FIX: Improved Gradient */}
													<div className='absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 via-30% to-transparent pointer-events-none' />
												</div>
											)}

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
														<h3 className='font-serif font-bold text-lg leading-tight text-foreground drop-shadow-sm m-0!'>
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

											{entityMatch && (
												<div className='bg-muted/50 p-2 border-t border-border'>
													<button
														onClick={handleWikiNav}
														className='w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold group'>
														<span className='flex items-center gap-2'>
															<BookOpen size={12} /> View Encyclopedia
														</span>
														<ArrowRight size={12} className='opacity-0 group-hover:opacity-100 transition-opacity' />
													</button>
												</div>
											)}
										</div>
									</Popup>
								)}
							</Marker>
						);
					})}
				</MapContainer>

				<div
					className={clsx(
						'absolute z-[10060] transition-all duration-300',
						activeFullscreen ? 'top-[50%] right-4 lg:top-6 lg:right-6 pr-safe pt-safe' : 'top-4 right-4'
					)}>
					<button
						onClick={toggleFullscreen}
						className={clsx(
							'p-3 rounded-full border border-border shadow-2xl transition-all active:scale-90',
							'bg-background/95 backdrop-blur-md text-foreground hover:bg-primary hover:text-white'
						)}
						title={activeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
						{activeFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
					</button>
				</div>
			</div>
		</div>
	);
};
