import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AtlasEditorProvider, useAtlasEditor } from './AtlasEditorContext';
import { MapZoomHandler } from '@/features/atlas/components/MapZoomHandler';

// UI
import EditorToolbar from './components/EditorToolbar';
import EditorSidebar from './components/EditorSidebar';
import EditorLayerList from './components/EditorLayerList';
import EditorMapEvents from './components/EditorMapEvents';

// Layers
import EditMarkersLayer from './layers/EditMarkersLayer';
import EditPathsLayer from './layers/EditPathsLayer';
import EditAreasLayer from './layers/EditAreasLayer';
import EditOverlaysLayer from './layers/EditOverlaysLayer';

function AtlasEditorInner() {
	const { state } = useAtlasEditor();
	const { mapConfig } = state;

	// ... tileConfig and bounds logic (same as before) ...
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
			{/* 1. Left Sidebar: Layer List */}
			<div className='hidden lg:block shrink-0 relative z-[500]'>
				<EditorLayerList />
			</div>

			{/* 2. Main Map Area */}
			<div className='flex-1 h-full relative z-0'>
				{/* Toolbar floats on top of map */}
				<EditorToolbar />

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
					<MapZoomHandler referenceZoom={3} />
					<TileLayer url={tileConfig.url} noWrap={true} bounds={bounds} maxNativeZoom={tileConfig.maxZoom} />

					<EditorMapEvents />
					<EditOverlaysLayer />
					<EditAreasLayer />
					<EditPathsLayer />
					<EditMarkersLayer />
				</MapContainer>
			</div>

			{/* 3. Right Sidebar: Forms */}
			<EditorSidebar />
		</div>
	);
}

export default function AtlasEditor({ initialData }) {
	return (
		<AtlasEditorProvider initialData={initialData}>
			<AtlasEditorInner />
		</AtlasEditorProvider>
	);
}
