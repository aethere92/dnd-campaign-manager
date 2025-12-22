import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Map, BookOpen, MapPin, Image as ImageIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { MapMarkers } from './layers/MapMarkers';
import { MapRecaps } from './layers/MapRecaps';
import { MapAreas } from './layers/MapAreas';
import { MapOverlays } from './layers/MapOverlays';
import { MapLayerControl } from './MapLayerControl';

const MapController = ({ bounds, minZoom, config }) => {
	const map = useMap();
	const prevConfigRef = useRef();

	useEffect(() => {
		if (!bounds) return;

		const isNewMap = prevConfigRef.current !== config.path;
		prevConfigRef.current = config.path;

		map.setMaxBounds(L.latLngBounds(bounds).pad(0.1));
		if (minZoom !== undefined) map.setMinZoom(minZoom);

		// Smooth transition for navigation, instant for new map
		map.fitBounds(bounds, {
			animate: !isNewMap,
			duration: isNewMap ? 0 : 0.5,
		});
	}, [map, bounds, minZoom, config.path]);

	return null;
};

export const MapCanvas = ({ data, onNavigate }) => {
	if (!data) return null;

	const { config, bounds, markers, sessions, areas, overlays } = data;
	const tileUrl = `https://raw.githubusercontent.com/aethere92/dnd-campaign-map/main/${config.path}/{z}/{x}_{y}.png`;

	// --- 1. Initialize Visibility ---
	const [visibility, setVisibility] = useState(() => {
		const init = { areas: false };

		// Initialize ALL marker categories to TRUE
		const uniqueCats = [...new Set(markers.map((m) => m.category))].filter(Boolean);
		uniqueCats.forEach((cat) => {
			init[`marker-${cat}`] = true;
		});

		// Sessions: OFF by default
		sessions.forEach((s) => {
			init[`session-${s.name}`] = false;
		});

		// Overlays: OFF by default
		overlays.forEach((o) => {
			init[`overlay-${o.name}`] = false;
		});

		return init;
	});

	// Safety: Ensure new categories are visible if data updates without remount
	useEffect(() => {
		const uniqueCats = [...new Set(markers.map((m) => m.category))].filter(Boolean);
		setVisibility((prev) => {
			const next = { ...prev };
			let changed = false;
			uniqueCats.forEach((cat) => {
				const key = `marker-${cat}`;
				if (next[key] === undefined) {
					next[key] = true;
					changed = true;
				}
			});
			return changed ? next : prev;
		});
	}, [markers]);

	const toggleLayer = (id) => {
		setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	// --- 2. Control Groups Configuration ---
	const controlGroups = useMemo(() => {
		const uniqueCats = [...new Set(markers.map((m) => m.category))].filter(Boolean).sort();

		return {
			overlays: overlays.length > 0 ? overlays.map((o) => ({ id: `overlay-${o.name}`, label: o.name })) : [],
			sessions: sessions.length > 0 ? sessions.map((s) => ({ id: `session-${s.name}`, label: s.name })) : [],
			markers: uniqueCats.map((c) => ({ id: `marker-${c}`, label: c })),
			// Passing icons for the UI to render
			icons: {
				overlays: ImageIcon,
				sessions: BookOpen,
				markers: MapPin,
				areas: Map,
			},
		};
	}, [markers, sessions, overlays]);

	// --- 3. Filter Layers ---
	const visibleMarkers = useMemo(() => {
		return markers.filter((m) => visibility[`marker-${m.category}`]);
	}, [markers, visibility]);

	const visibleSessions = useMemo(() => {
		return sessions.filter((s) => visibility[`session-${s.name}`]);
	}, [sessions, visibility]);

	const visibleOverlays = useMemo(() => {
		return overlays.filter((o) => visibility[`overlay-${o.name}`]);
	}, [overlays, visibility]);

	// FIX: Changed minZoom from 2 to 0.
	// This prevents the map from getting "stuck" zoomed in when loading smaller maps.
	const minZoom = 0;

	const bgValue = config.backgroundColor || '#1a1412';
	const isImage = bgValue.includes('url') || bgValue.includes('gradient');

	return (
		<div
			style={{
				height: '100%',
				width: '100%',
				backgroundColor: isImage ? '#1a1412' : bgValue,
				backgroundImage: isImage ? bgValue : 'none',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
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

				<MapOverlays overlays={visibleOverlays} />
				{visibility['areas'] && <MapAreas areas={areas} />}
				<MapRecaps sessions={visibleSessions} />
				<MapMarkers markers={visibleMarkers} onNavigate={onNavigate} />

				<MapLayerControl groups={controlGroups} visibility={visibility} toggleLayer={toggleLayer} />
			</MapContainer>
		</div>
	);
};
