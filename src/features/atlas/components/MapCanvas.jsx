import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { MapMarkers } from './layers/MapMarkers';
import { MapRecaps } from './layers/MapRecaps';
import { MapAreas } from './layers/MapAreas';
import { MapOverlays } from './layers/MapOverlays';
import { MapTools } from './MapTools';
import { MapZoomHandler } from './MapZoomHandler';
import { AtlasSidebar } from './AtlasSidebar';
import { useMapCanvasViewModel } from './useMapCanvasViewModel';

// Controller to handle FlyTo from sidebar
const MapController = ({ bounds, minZoom, config, flyToTarget }) => {
	const map = useMap();
	const prevConfigRef = useRef();

	// Handle initial bounds
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

	// Handle Sidebar FlyTo
	useEffect(() => {
		if (flyToTarget) {
			map.flyTo(flyToTarget, config.sizes.maxZoom - 1, {
				animate: true,
				duration: 1.5,
			});
		}
	}, [map, flyToTarget]);

	return null;
};

export const MapCanvas = ({ data, onNavigate }) => {
	if (!data) return null;

	const { config, bounds, areas } = data;
	const vm = useMapCanvasViewModel(data);
	const wrapperRef = useRef(null);
	const [flyToTarget, setFlyToTarget] = useState(null);

	const fileExt = config.fileExtension || 'png';
	const isAbsolute = config.path.startsWith('http');
	const baseUrl = isAbsolute
		? config.path
		: `https://raw.githubusercontent.com/aethere92/dnd-campaign-map/main/${config.path}`;

	// 3. Construct the Tile URL
	const tileUrl = `${baseUrl}/{z}/{x}_{y}.${fileExt}`;
	const minZoom = 0;

	return (
		<div className='flex h-full w-full relative overflow-hidden'>
			{/* MAP AREA - First in DOM (Left side in flex row) */}
			<div
				ref={wrapperRef}
				className='flex-1 relative h-full bg-background'
				style={{
					backgroundColor: 'var(--background)',
					backgroundImage:
						'radial-gradient(circle at center, var(--border) 1px, transparent 1px), radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
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
					<MapController bounds={bounds} minZoom={minZoom} config={config} flyToTarget={flyToTarget} />
					<MapZoomHandler referenceZoom={3} />

					<TileLayer key={tileUrl} url={tileUrl} noWrap={true} bounds={bounds} maxNativeZoom={config.sizes.maxZoom} />

					<MapOverlays overlays={vm.visibleOverlays} />
					{vm.showAreas && <MapAreas areas={areas} />}
					<MapRecaps sessions={vm.visibleSessions} />
					<MapMarkers markers={vm.visibleMarkers} onNavigate={onNavigate} />

					<MapTools bounds={bounds} containerRef={wrapperRef} />
				</MapContainer>
			</div>

			{/* ATLAS SIDEBAR - Second in DOM (Right side) */}
			<AtlasSidebar
				groups={vm.sidebarGroups}
				visibility={vm.visibility}
				onToggleLayer={vm.toggleLayer}
				onFlyTo={setFlyToTarget}
			/>
		</div>
	);
};
