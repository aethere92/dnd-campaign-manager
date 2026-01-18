import React, { useState } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';

export default function CoordinatesDisplay() {
	const map = useMap();
	const [coords, setCoords] = useState(null);
	// Initialize with current map zoom
	const [zoom, setZoom] = useState(map.getZoom());

	useMapEvents({
		mousemove(e) {
			requestAnimationFrame(() => {
				// Convert container point to layer point for accurate coordinates
				const layerPoint = map.containerPointToLayerPoint(e.containerPoint);
				const latlng = map.layerPointToLatLng(layerPoint);
				setCoords(latlng);
			});
		},
		mouseout() {
			setCoords(null);
		},
		zoom(e) {
			// Update zoom on scroll/zoom interactions
			setZoom(Math.round(e.target.getZoom() * 10) / 10);
		},
	});

	return (
		<div className='absolute bottom-3 left-3 z-[1000] pointer-events-none'>
			<div className='flex items-center gap-3 px-3 py-1.5 bg-background/90 backdrop-blur border border-border shadow-md rounded-md text-[10px] font-mono font-bold text-muted-foreground tabular-nums'>
				{/* Latitude */}
				<div className='flex gap-1 min-w-[70px]'>
					<span className='text-primary uppercase'>Lat</span>
					<span className='text-foreground'>{coords ? coords.lat.toFixed(4) : '---'}</span>
				</div>

				<div className='w-px h-3 bg-border' />

				{/* Longitude */}
				<div className='flex gap-1 min-w-[70px]'>
					<span className='text-primary uppercase'>Lng</span>
					<span className='text-foreground'>{coords ? coords.lng.toFixed(4) : '---'}</span>
				</div>

				<div className='w-px h-3 bg-border' />

				{/* Zoom Level */}
				<div className='flex gap-1 min-w-[40px]'>
					<span className='text-primary uppercase'>Zoom</span>
					<span className='text-foreground'>{zoom}</span>
				</div>
			</div>
		</div>
	);
}
