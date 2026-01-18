import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AtlasEditorProvider, useAtlasEditor } from './AtlasEditorContext';
import { MapZoomHandler } from './components/MapZoomHandler';
import AtlasContextMenu from './components/EditorContextMenu';
import { Crosshair } from 'lucide-react'; // Import Icon

// UI
import EditorToolbar from './components/EditorToolbar';
import EditorSidebar from './components/EditorSidebar';
import EditorLayerList from './components/EditorLayerList';
import EditorMapEvents from './components/EditorMapEvents';
import CoordinatesDisplay from './components/CoordinatesDisplay';

// Layers
import EditMarkersLayer from './layers/EditMarkersLayer';
import EditPathsLayer from './layers/EditPathsLayer';
import EditAreasLayer from './layers/EditAreasLayer';
import EditOverlaysLayer from './layers/EditOverlaysLayer';

// NEW: The Source of Truth Element
const EditorReticle = () => {
	const { state } = useAtlasEditor();

	// Only show when "Map Properties" is active
	if (state.selection?.type !== 'settings') return null;

	return (
		// 1. Position Container:
		//    'right-80' (320px) matches your sidebar width class.
		//    If you change sidebar width in CSS, change it here in CSS classes only.
		//    'bottom-20' matches toolbar height roughly, or remove if you want vertical center.
		<div className='absolute top-0 left-0 bottom-0 right-80 pointer-events-none z-[1000] flex items-center justify-center animate-in fade-in duration-200'>
			{/* 2. The Actual Target ID used by JS */}
			<div id='viewport-target' className='relative text-primary drop-shadow-md'>
				<Crosshair size={32} strokeWidth={1} />
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full' />
			</div>

			{/* Helper Text */}
			<div className='absolute top-1/2 mt-8 bg-black/75 text-white text-[10px] px-2 py-1 rounded'>Center Point</div>
		</div>
	);
};

function AtlasEditorInner() {
	const { state } = useAtlasEditor();
	const { mapConfig } = state;

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

	if (!bounds || !tileConfig) return <div className='text-white p-10'>Invalid Configuration or Missing Metadata</div>;

	return (
		<div className='flex h-full w-full relative overflow-hidden bg-[#1a1412]'>
			<div className='hidden lg:block shrink-0 relative z-[500]'>
				<EditorLayerList />
			</div>

			<div className='flex-1 h-full relative z-0'>
				<EditorToolbar />

				{/* INSERT RETICLE HERE */}
				<EditorReticle />

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
					<CoordinatesDisplay />
				</MapContainer>
				<AtlasContextMenu />
			</div>

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
