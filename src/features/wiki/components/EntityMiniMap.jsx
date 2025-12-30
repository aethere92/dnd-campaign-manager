import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Maximize, Minimize } from 'lucide-react';
import { clsx } from 'clsx';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

const MapController = ({ bounds }) => {
	const map = useMap();
	useEffect(() => {
		if (bounds) {
			map.fitBounds(bounds);
			map.setMaxBounds(bounds.pad(0.1));
		}
	}, [map, bounds]);
	return null;
};

export const EntityMiniMap = ({ imageUrl, title }) => {
	const [dimensions, setDimensions] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const containerRef = useRef(null);

	// 1. Sync Fullscreen State with Browser Events
	useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	}, []);

	// 2. Load Image and Calculate Bounds
	useEffect(() => {
		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			const w = img.width;
			const h = img.height;
			// Southwest is [-height, 0], Northeast is [0, width]
			const southWest = [-h, 0];
			const northEast = [0, w];
			setDimensions(L.latLngBounds(southWest, northEast));
			setLoading(false);
		};
	}, [imageUrl]);

	const toggleFullscreen = (e) => {
		e.stopPropagation();
		if (!containerRef.current) return;

		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error enabling fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	if (loading)
		return (
			<div className='h-64 w-full bg-muted rounded-xl flex items-center justify-center border border-border mb-8'>
				<LoadingSpinner text='Generating tactical view...' size='sm' />
			</div>
		);

	return (
		<div className='mb-10 space-y-3 group' ref={containerRef}>
			{/* Header (Hidden in fullscreen) */}
			{!isFullscreen && (
				<div className='flex items-center justify-between px-1'>
					<h3 className='font-serif text-lg mt-0 font-bold text-foreground mb-3 flex items-center gap-2'>
						<MapIcon size={16} className='text-accent' /> Map
					</h3>
				</div>
			)}

			<div
				className={clsx(
					'w-full rounded-xl border border-border overflow-hidden shadow-sm relative z-0',
					isFullscreen ? 'h-screen rounded-none border-0' : 'h-96'
				)}>
				<MapContainer
					crs={L.CRS.Simple}
					bounds={dimensions}
					zoom={0}
					minZoom={-3}
					scrollWheelZoom={true} // FIXED: Enabled scroll to zoom
					attributionControl={false}
					style={{
						height: '100%',
						width: '100%',
						backgroundColor: 'var(--background)',
						// STAR PATTERN: Adapted from GraphPage.jsx
						backgroundImage:
							'radial-gradient(circle at center, #e5e5e5 1px, transparent 1px), radial-gradient(circle at center, #e5e5e5 1px, transparent 1px)',
						backgroundSize: '40px 40px, 20px 20px',
						backgroundPosition: '0 0, 20px 20px',
					}}>
					<MapController bounds={dimensions} />
					<ImageOverlay url={imageUrl} bounds={dimensions} />
				</MapContainer>

				{/* Fullscreen Toggle Button */}
				<div className='absolute top-3 right-3 z-[1000]'>
					<button
						onClick={toggleFullscreen}
						className='p-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-lg text-muted-foreground hover:text-accent transition-all active:scale-95'
						title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
						{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
					</button>
				</div>

				{/* Interaction Hint */}
				{!isFullscreen && (
					<div className='absolute bottom-3 right-3 z-[400] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'>
						<div className='bg-background/90 backdrop-blur-sm px-2 py-1 rounded border border-border text-[9px] font-bold uppercase text-muted-foreground shadow-lg'>
							Scroll to Zoom • Drag to Pan
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
