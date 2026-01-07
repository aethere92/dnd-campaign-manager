import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AtlasEditorProvider, useAtlasEditor } from './AtlasEditorContext';

// UI
import EditorToolbar from './components/EditorToolbar';
import EditorSidebar from './components/EditorSidebar';
import EditorMapEvents from './components/EditorMapEvents';

// Layers
import EditMarkersLayer from './layers/EditMarkersLayer';
import EditPathsLayer from './layers/EditPathsLayer';
import EditAreasLayer from './layers/EditAreasLayer';
import EditOverlaysLayer from './layers/EditOverlaysLayer';

function AtlasEditorInner() {
	const { state } = useAtlasEditor();
	const { mapConfig } = state;

	// Calculate Tile Config
	const tileConfig = useMemo(() => {
		if (!mapConfig) return null;
		const fileExt = mapConfig.fileExtension || 'png';
		const isAbsolute = mapConfig.path.startsWith('http');
		const baseUrl = isAbsolute
			? mapConfig.path
			: `https://raw.githubusercontent.com/aethere92/dnd-campaign-map/main/${mapConfig.path}`;

		return {
			url: `${baseUrl}/{z}/{x}_{y}.${fileExt}`,
			maxZoom: mapConfig.sizes?.maxZoom || 4,
			minZoom: 0,
		};
	}, [mapConfig]);

	// Calculate Bounds
	const bounds = useMemo(() => {
		if (!mapConfig?.sizes) return null;
		const scaleFactor = Math.pow(2, mapConfig.sizes.maxZoom);
		return [
			[-mapConfig.sizes.imageHeight / scaleFactor, 0],
			[0, mapConfig.sizes.imageWidth / scaleFactor],
		];
	}, [mapConfig]);

	if (!bounds || !tileConfig) return <div>Invalid Configuration</div>;

	return (
		<div className='flex h-full w-full relative overflow-hidden bg-[#1a1412]'>
			<EditorToolbar />

			<div className='flex-1 h-full z-0'>
				<MapContainer
					center={[0, 0]}
					zoom={0}
					crs={L.CRS.Simple}
					minZoom={tileConfig.minZoom}
					maxZoom={tileConfig.maxZoom}
					scrollWheelZoom={true}
					attributionControl={false}
					zoomControl={false}
					style={{ height: '100%', width: '100%', background: 'transparent' }}>
					<TileLayer url={tileConfig.url} noWrap={true} bounds={bounds} maxNativeZoom={tileConfig.maxZoom} />

					{/* LOGIC & LAYERS */}
					<EditorMapEvents />
					<EditOverlaysLayer />
					<EditAreasLayer />
					<EditPathsLayer />
					<EditMarkersLayer />
				</MapContainer>
			</div>

			<EditorSidebar />
		</div>
	);
}

// Wrapper to provide Context
export default function AtlasEditor({ initialData }) {
	return (
		<AtlasEditorProvider initialData={initialData}>
			<AtlasEditorInner />
		</AtlasEditorProvider>
	);
}
