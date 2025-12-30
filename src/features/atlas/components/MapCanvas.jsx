import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { MapMarkers } from './layers/MapMarkers';
import { MapRecaps } from './layers/MapRecaps';
import { MapAreas } from './layers/MapAreas';
import { MapOverlays } from './layers/MapOverlays';
import { MapLayerControl } from './MapLayerControl';
import { MapTools } from './MapTools'; // Import the new component
import { useMapCanvasViewModel } from './useMapCanvasViewModel';

const MapController = ({ bounds, minZoom, config }) => {
	const map = useMap();
	const prevConfigRef = useRef();

	useEffect(() => {
		if (!bounds) return;

		const isNewMap = prevConfigRef.current !== config.path;
		prevConfigRef.current = config.path;

		map.setMaxBounds(L.latLngBounds(bounds).pad(0.1));
		if (minZoom !== undefined) map.setMinZoom(minZoom);

		map.fitBounds(bounds, {
			animate: !isNewMap,
			duration: isNewMap ? 0 : 0.5,
		});
	}, [map, bounds, minZoom, config.path]);

	return null;
};

export const MapCanvas = ({ data, onNavigate }) => {
	if (!data) return null;

	const { config, bounds, areas } = data;
	const vm = useMapCanvasViewModel(data);
	const wrapperRef = useRef(null); // Ref for fullscreen

	const tileUrl = `https://raw.githubusercontent.com/aethere92/dnd-campaign-map/main/${config.path}/{z}/{x}_{y}.png`;
	const minZoom = 0;
	// const bgValue = config.backgroundColor || '#1a1412';
	// const isImage = bgValue.includes('url') || bgValue.includes('gradient');

	return (
		<div
			ref={wrapperRef}
			style={{
				height: '100%',
				width: '100%',
				// backgroundColor: isImage ? '#1a1412' : bgValue,
				// backgroundImage: isImage ? bgValue : 'none',
				// backgroundSize: 'cover',
				// backgroundPosition: 'center',
				// backgroundRepeat: 'no-repeat',
				backgroundColor: 'var(--background)',
				backgroundImage:
					'radial-gradient(circle at center, #e5e5e5 1px, transparent 1px), radial-gradient(circle at center, #e5e5e5 1px, transparent 1px)',
				backgroundSize: '40px 40px, 20px 20px',
				backgroundPosition: '0 0, 20px 20px',
			}}>
			<MapContainer
				center={[0, 0]}
				zoom={minZoom}
				crs={L.CRS.Simple}
				minZoom={minZoom}
				maxZoom={config.sizes.maxZoom}
				scrollWheelZoom={true}
				attributionControl={false}
				zoomControl={false}
				style={{ height: '100%', width: '100%', background: 'transparent' }}>
				<MapController bounds={bounds} minZoom={minZoom} config={config} />

				<TileLayer key={tileUrl} url={tileUrl} noWrap={true} bounds={bounds} maxNativeZoom={config.sizes.maxZoom} />

				<MapOverlays overlays={vm.visibleOverlays} />
				{vm.showAreas && <MapAreas areas={areas} />}
				<MapRecaps sessions={vm.visibleSessions} />
				<MapMarkers markers={vm.visibleMarkers} onNavigate={onNavigate} />

				<MapLayerControl groups={vm.controlGroups} visibility={vm.visibility} toggleLayer={vm.toggleLayer} />

				{/* New Tools Component */}
				<MapTools bounds={bounds} containerRef={wrapperRef} />
			</MapContainer>
		</div>
	);
};
