import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Pane } from 'react-leaflet'; // Added Pane
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AtlasEditorProvider, useAtlasEditor } from './AtlasEditorContext';
import { MapZoomHandler } from './components/MapZoomHandler';
import AtlasContextMenu from './components/EditorContextMenu';
import { Crosshair } from 'lucide-react';

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
import { MapFogLayer } from '@/features/atlas/components/layers/MapFogLayer';
import { EditFogLayer } from './layers/EditFogLayer';

// ... (Keep EditorReticle) ...
const EditorReticle = () => {
	/* ... existing code ... */ return null;
};

function AtlasEditorInner() {
	const { state } = useAtlasEditor();
	const { mapConfig, fog, visibility } = state;

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

	if (!bounds || !tileConfig) return <div className='text-white p-10'>Invalid Configuration</div>;

	return (
		<div
			className='flex h-full w-full relative overflow-hidden'
			style={{
				backgroundColor: 'var(--background)',
				backgroundImage:
					'radial-gradient(circle at center, var(--border) 1px, transparent 1px), radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
				backgroundSize: '40px 40px, 20px 20px',
				backgroundPosition: '0 0, 20px 20px',
			}}>
			<div className='hidden lg:block shrink-0 relative z-[500]'>
				<EditorLayerList />
			</div>

			<div className='flex-1 h-full relative z-0'>
				<EditorToolbar />
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

					{/* Standard Content */}
					<EditOverlaysLayer />
					<EditAreasLayer />
					<EditPathsLayer />
					<EditMarkersLayer />

					{/* FOG LAYER (Above Markers) */}
					<Pane name='fogPane' style={{ zIndex: 620, pointerEvents: 'none' }}>
						{visibility.fog && <MapFogLayer fogConfig={fog} bounds={bounds} />}
					</Pane>

					{/* FOG EDIT HANDLES (Above Fog) */}
					{/* We need these visible even if they are 'in the fog' so you can edit them */}
					<Pane name='fogEditPane' style={{ zIndex: 630 }}>
						{visibility.fog && <EditFogLayer />}
					</Pane>

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
