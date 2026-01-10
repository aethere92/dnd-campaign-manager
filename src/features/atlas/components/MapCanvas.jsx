import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarkers } from './layers/MapMarkers';
import { MapRecaps } from './layers/MapRecaps';
import { MapAreas } from './layers/MapAreas';
import { MapOverlays } from './layers/MapOverlays';
import { MapTools } from './MapTools';
import { MapZoomHandler } from './MapZoomHandler';
import { useAtlas } from '../context/AtlasContext';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

const MapController = ({ config, flyToTarget }) => {
	const map = useMap();
	const prevMapId = useRef();

	useEffect(() => {
		if (!config || !config.sizes) return;
		const scaleFactor = Math.pow(2, config.sizes.maxZoom);
		const bounds = [
			[-config.sizes.imageHeight / scaleFactor, 0],
			[0, config.sizes.imageWidth / scaleFactor],
		];

		map.setMaxBounds(L.latLngBounds(bounds).pad(0.1));
		if (prevMapId.current !== config.key) {
			map.fitBounds(bounds, { animate: false });
			prevMapId.current = config.key;
		}
	}, [map, config]);

	useEffect(() => {
		if (flyToTarget) map.flyTo(flyToTarget, config.sizes.maxZoom, { animate: true, duration: 1.5 });
	}, [map, flyToTarget, config]);

	return null;
};

export const MapCanvas = () => {
	const { mapData, isLoading, visibility, flyToTarget } = useAtlas();
	const wrapperRef = useRef(null);

	if (isLoading || !mapData) {
		return (
			<div className='flex-1 flex items-center justify-center bg-[#1a1412]'>
				<LoadingSpinner text='Unrolling...' className='text-amber-500' />
			</div>
		);
	}

	const { config, markers, sessions, overlays, areas } = mapData;
	const visibleMarkers = markers.filter((m) => visibility[m.id]);
	const visibleSessions = sessions.filter((s) => visibility[`session-${s.name}`]);
	const visibleOverlays = overlays.filter((o) => visibility[`overlay-${o.name}`]);
	const visibleAreas = areas.filter((a) => visibility[a.id]);

	const isAbsolute = config.path.startsWith('http');
	const baseUrl = isAbsolute
		? config.path
		: `https://raw.githubusercontent.com/aethere92/dnd-campaign-map/main/${config.path}`;
	const tileUrl = `${baseUrl}/{z}/{x}_{y}.${config.fileExtension || 'png'}`;

	return (
		<div ref={wrapperRef} className='flex-1 relative h-full bg-background'>
			<MapContainer
				center={[0, 0]}
				zoom={0}
				crs={L.CRS.Simple}
				minZoom={0}
				maxZoom={config.sizes.maxZoom}
				scrollWheelZoom={true}
				attributionControl={false}
				zoomControl={false}
				style={{ height: '100%', width: '100%', background: 'transparent' }}>
				<MapController config={config} flyToTarget={flyToTarget} />
				<MapZoomHandler referenceZoom={3} />
				<TileLayer key={tileUrl} url={tileUrl} noWrap={true} maxNativeZoom={config.sizes.maxZoom} />

				<MapOverlays overlays={visibleOverlays} />
				<MapAreas areas={visibleAreas} />
				<MapRecaps sessions={visibleSessions} />
				<MapMarkers markers={visibleMarkers} />
				<MapTools containerRef={wrapperRef} />
			</MapContainer>
		</div>
	);
};
