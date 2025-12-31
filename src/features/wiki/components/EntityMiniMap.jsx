import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Maximize, Minimize } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

/**
 * REFACTORED: MapController now handles viewport recalibration
 * when switching in/out of fullscreen modes.
 */
const MapController = ({ bounds, activeFullscreen }) => {
	const map = useMap();

	useEffect(() => {
		if (bounds && map) {
			// Small timeout ensures the DOM has finished its layout transition (h-96 <-> h-screen)
			const timer = setTimeout(() => {
				map.invalidateSize({ animate: true });
				map.fitBounds(bounds, { padding: [20, 20] });
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [map, bounds, activeFullscreen]); // Re-run when fullscreen toggles

	return null;
};

export const EntityMiniMap = ({ imageUrl, markers = [] }) => {
	const [dimensions, setDimensions] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
	const containerRef = useRef(null);

	// Unified flag for UI
	const activeFullscreen = isFullscreen || isPseudoFullscreen;

	// Native Fullscreen Sync
	useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	}, []);

	// iOS Fallback Escape Handler
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
							'radial-gradient(circle at center, #e5e5e5 1px, transparent 1px), radial-gradient(circle at center, #e5e5e5 1px, transparent 1px)',
						backgroundSize: '40px 40px, 20px 20px',
						backgroundPosition: '0 0, 20px 20px',
					}}>
					{/* PASS activeFullscreen to the controller */}
					<MapController bounds={dimensions} activeFullscreen={activeFullscreen} />
					<ImageOverlay url={imageUrl} bounds={dimensions} />

					{markers.map((m, idx) => (
						<Marker key={idx} position={[m.lat, m.lng]} icon={resolveMarkerIcon(m)}>
							{m.label && (
								<Popup>
									<div className='marker-popup-card'>
										<div className='marker-popup-header'>
											<span className='marker-popup-category'>{m.category || 'POI'}</span>
											<div className='marker-popup-title'>{m.label}</div>
										</div>
										{m.description && <div className='marker-popup-body'>{m.description}</div>}
									</div>
								</Popup>
							)}
						</Marker>
					))}
				</MapContainer>

				<div
					className='absolute z-[10001]'
					style={
						activeFullscreen
							? {
									// FULLSCREEN: Bottom-Right
									bottom: 'max(2rem, env(safe-area-inset-bottom))',
									right: 'max(2rem, env(safe-area-inset-right))',
							  }
							: {
									// NORMAL: Top-Right
									top: '1rem',
									right: '1rem',
							  }
					}>
					<button
						onClick={toggleFullscreen}
						className={clsx(
							'p-3 rounded-full border border-border shadow-2xl transition-all active:scale-90',
							'bg-background/95 backdrop-blur-md text-accent hover:bg-accent hover:text-white'
						)}
						title={activeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
						{activeFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
					</button>
				</div>
			</div>
		</div>
	);
};
