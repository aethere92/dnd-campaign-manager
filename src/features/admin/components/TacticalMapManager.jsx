import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor, AtlasEditorProvider } from './atlas/AtlasEditorContext';
import { serializeMapData } from './atlas/services/atlasMapper';

// Editor UI
import EditorToolbar from './atlas/components/EditorToolbar';
import EditorSidebar from './atlas/components/EditorSidebar';
import EditorLayerList from './atlas/components/EditorLayerList';
import EditorMapEvents from './atlas/components/EditorMapEvents';
import AtlasContextMenu from './atlas/components/EditorContextMenu';
import { MapZoomHandler } from './atlas/components/MapZoomHandler';

// Layers
import EditMarkersLayer from './atlas/layers/EditMarkersLayer';
import EditPathsLayer from './atlas/layers/EditPathsLayer';
import EditAreasLayer from './atlas/layers/EditAreasLayer';
import EditOverlaysLayer from './atlas/layers/EditOverlaysLayer';

import { Target, Maximize, Minimize } from 'lucide-react';
import { clsx } from 'clsx';

// ------------------------------------------------------------------
// 1. STATE SYNCER
// ------------------------------------------------------------------
const StateSyncer = ({ onChange }) => {
	const { state } = useAtlasEditor();
	useEffect(() => {
		const timer = setTimeout(() => {
			const serialized = serializeMapData(state);
			onChange(JSON.stringify(serialized));
		}, 500);
		return () => clearTimeout(timer);
	}, [state, onChange]);
	return null;
};

// ------------------------------------------------------------------
// 2. FULLSCREEN HANDLER
// Forces Leaflet to re-calculate its size when the container grows
// ------------------------------------------------------------------
const FullscreenHandler = ({ isFullscreen }) => {
	const map = useMap();
	useEffect(() => {
		// Small delay to ensure the DOM transition has finished
		const timer = setTimeout(() => {
			map.invalidateSize();
		}, 100);
		return () => clearTimeout(timer);
	}, [map, isFullscreen]);
	return null;
};

// ------------------------------------------------------------------
// 3. INTERNAL CANVAS
// ------------------------------------------------------------------
const TacticalEditorCanvas = ({ imageUrl, dimensions }) => {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const toggleFullscreen = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		setIsFullscreen(!isFullscreen);
	};

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isFullscreen]);

	const content = (
		<div
			className={clsx(
				'flex w-full overflow-hidden bg-[#1a1412] border border-border shadow-inner transition-all duration-300',
				// We use !important styles to ensure we escape any parent container offsets
				isFullscreen
					? 'fixed !top-0 !left-0 !right-0 !bottom-0 !m-0 z-[5000] h-screen w-screen'
					: 'relative h-[600px] rounded-lg'
			)}>
			<div className='hidden lg:block shrink-0 relative z-[400] h-full'>
				<EditorLayerList />
			</div>

			<div className='flex-1 h-full relative z-0'>
				<EditorToolbar />

				<button
					onClick={toggleFullscreen}
					className='absolute top-4 right-4 z-[1000] p-2 bg-background/90 backdrop-blur border border-border shadow-md rounded-md hover:bg-primary hover:text-white transition-colors text-muted-foreground'
					title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}>
					{isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
				</button>

				<MapContainer
					crs={L.CRS.Simple}
					bounds={dimensions}
					center={[dimensions[0][0] / 2, dimensions[1][1] / 2]}
					zoom={0}
					minZoom={-2}
					maxZoom={4}
					scrollWheelZoom={true}
					attributionControl={false}
					zoomControl={false}
					style={{ height: '100%', width: '100%', background: 'transparent' }}>
					{/* CRITICAL: Listens for resize */}
					<FullscreenHandler isFullscreen={isFullscreen} />

					<MapZoomHandler referenceZoom={1} />
					<ImageOverlay url={imageUrl} bounds={dimensions} />
					<EditorMapEvents />
					<EditOverlaysLayer />
					<EditAreasLayer />
					<EditPathsLayer />
					<EditMarkersLayer />
				</MapContainer>
				<AtlasContextMenu />
			</div>

			<EditorSidebar />
		</div>
	);

	return isFullscreen ? createPortal(content, document.body) : content;
};

// ------------------------------------------------------------------
// 4. MAIN MANAGER
// ------------------------------------------------------------------
export default function TacticalMapManager({ imageUrl, value, onChange }) {
	const [dimensions, setDimensions] = useState(null);

	useEffect(() => {
		if (!imageUrl) return;
		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			setDimensions([
				[-img.height, 0],
				[0, img.width],
			]);
		};
	}, [imageUrl]);

	const initialData = useMemo(() => {
		let raw = value;
		if (typeof raw === 'string') {
			try {
				raw = JSON.parse(raw);
			} catch {
				raw = {};
			}
		}
		return raw || {};
	}, []);

	if (!imageUrl) return null;
	if (!dimensions) return <div className='p-4 text-xs text-muted-foreground'>Loading Map Image...</div>;

	return (
		<div className='space-y-2'>
			<div className='flex items-center justify-between px-1'>
				<span className='flex items-center gap-2 font-bold text-sm text-foreground'>
					<Target size={16} className='text-primary' /> Tactical Map Editor
				</span>
				<span className='text-[10px] text-muted-foreground uppercase tracking-widest'>
					{dimensions[1][1]} x {Math.abs(dimensions[0][0])}px
				</span>
			</div>

			<AtlasEditorProvider
				onSave={() => {}}
				initialData={{
					...initialData,
					metadata: {
						mapId: 'tactical_temp',
						sizes: {
							imageHeight: Math.abs(dimensions[0][0]),
							imageWidth: dimensions[1][1],
							maxZoom: 4,
						},
					},
				}}>
				<StateSyncer onChange={onChange} />
				<TacticalEditorCanvas imageUrl={imageUrl} dimensions={dimensions} />
			</AtlasEditorProvider>
		</div>
	);
}
