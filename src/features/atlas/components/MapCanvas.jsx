import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Pane } from 'react-leaflet';
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
import { useSearchParams } from 'react-router-dom';
import { MapFogLayer } from './layers/MapFogLayer';

const MapController = ({ config, flyToTarget }) => {
	const map = useMap();
	const prevMapId = useRef();
	const [searchParams] = useSearchParams();

	// Use mapId from DB config, fallback to key if needed
	const uniqueMapId = config.mapId || config.key;

	useEffect(() => {
		if (!config || !config.sizes) return;

		const scaleFactor = Math.pow(2, config.sizes.maxZoom);
		const bounds = [
			[-config.sizes.imageHeight / scaleFactor, 0],
			[0, config.sizes.imageWidth / scaleFactor],
		];
		map.setMaxBounds(L.latLngBounds(bounds).pad(0.1));

		if (prevMapId.current !== uniqueMapId) {
			let viewSet = false;

			// FIX: Force Leaflet to recognize container size before setting view
			map.invalidateSize();

			const urlLat = searchParams.get('lat');
			const urlLng = searchParams.get('lng');
			const urlZ = searchParams.get('z');

			if (urlLat && urlLng && urlZ) {
				map.setView([urlLat, urlLng], urlZ, { animate: false });
				viewSet = true;
			} else if (config.initialView) {
				const { lat, lng, zoom } = config.initialView;
				map.setView([lat, lng], zoom, { animate: false });
				viewSet = true;
			}

			if (!viewSet) {
				map.fitBounds(bounds, { animate: false });
			}

			prevMapId.current = uniqueMapId;
		}
	}, [map, config, searchParams, uniqueMapId]);

	useEffect(() => {
		if (flyToTarget) {
			// FIX: Invalidate size before flying to ensure target is centered visually
			map.invalidateSize();
			map.flyTo(flyToTarget, config.sizes.maxZoom, { animate: true, duration: 1.5 });
		}
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

	const { config, markers, sessions, overlays, areas, fog } = mapData;
	const visibleMarkers = markers.filter((m) => visibility[m.id]);
	const visibleSessions = sessions.filter((s) => visibility[`session-${s.name}`]);
	const visibleOverlays = overlays.filter((o) => visibility[`overlay-${o.name}`]);
	const visibleAreas = areas.filter((a) => visibility[a.id]);

	const isAbsolute = config.path.startsWith('http');
	const baseUrl = isAbsolute
		? config.path
		: `https://raw.githubusercontent.com/aethere92/dnd-campaign-map/main/${config.path}`;
	const tileUrl = `${baseUrl}/{z}/{x}_{y}.${config.fileExtension || 'png'}`;
	const scaleFactor = Math.pow(2, config.sizes.maxZoom);
	const bounds = [
		[-config.sizes.imageHeight / scaleFactor, 0],
		[0, config.sizes.imageWidth / scaleFactor],
	];
	const showFog = fog && fog.enabled === true && visibility['fog'] === true;

	return (
		<div
			ref={wrapperRef}
			className='flex-1 relative h-full'
			style={{
				backgroundColor: 'var(--background)',
				backgroundImage:
					'radial-gradient(circle at center, var(--border) 1px, transparent 1px), radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
				backgroundSize: '40px 40px, 20px 20px',
				backgroundPosition: '0 0, 20px 20px',
			}}>
			<MapContainer
				center={[0, 0]}
				zoom={Math.ceil(config.sizes.maxZoom / 2)}
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
				<Pane name='fogPane' style={{ zIndex: 620, pointerEvents: 'none' }}>
					{showFog && <MapFogLayer fogConfig={fog} bounds={bounds} />}
				</Pane>
				<MapTools containerRef={wrapperRef} />
			</MapContainer>
		</div>
	);
};
