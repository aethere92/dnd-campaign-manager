/* --- FILE: features/wiki/components/EntityMiniMap.jsx --- */
import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Maximize, Minimize, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { clsx } from 'clsx';
import { AtlasProvider } from '@/features/atlas/context/AtlasContext';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { useFullscreen } from '@/shared/hooks/useFullscreen';

// REUSED ATLAS LOGIC
import { useMapCanvas } from '@/features/atlas/hooks/useMapCanvas';
import { MapZoomHandler } from '@/features/atlas/components/MapZoomHandler';
import { normalizeMapData, parseMapData } from '@/features/atlas/utils/atlasMapper';

// REUSED ATLAS COMPONENTS
import { SidebarGroup } from '@/features/atlas/components/sidebar/SidebarGroup';
import { MapMarkers } from '@/features/atlas/components/layers/MapMarkers';
import { MapAreas } from '@/features/atlas/components/layers/MapAreas';
import { MapRecaps } from '@/features/atlas/components/layers/MapRecaps';
import { MapOverlays } from '@/features/atlas/components/layers/MapOverlays';

// ----------------------------------------------------------------------
// MAP CONTROLLER
// ----------------------------------------------------------------------
const MapController = ({ bounds, flyToTarget }) => {
	const map = useMap();

	// Initial Fit
	useEffect(() => {
		if (bounds && map) {
			map.invalidateSize();
			map.fitBounds(bounds, { padding: [20, 20], animate: false });
		}
	}, [map, bounds]);

	// Fly To Logic
	useEffect(() => {
		if (flyToTarget && map) {
			map.flyTo(flyToTarget, 3, { animate: true, duration: 1.5 });
		}
	}, [flyToTarget, map]);

	return null;
};

// ----------------------------------------------------------------------
// MINI SIDEBAR (Exact same structure as AtlasSidebar)
// ----------------------------------------------------------------------
const MiniSidebar = ({ isOpen, setIsOpen, viewModel, onFlyTo }) => {
	const { sidebarGroups, visibility, toggleLayer } = viewModel;

	return (
		<div
			className={clsx(
				'absolute top-0 left-0 bottom-0 z-[500] flex flex-col transition-all duration-300 ease-in-out border-r border-border shadow-xl',
				isOpen ? 'w-64 bg-muted/95 backdrop-blur-sm' : 'w-0 overflow-hidden bg-transparent border-none'
			)}>
			{/* Header */}
			<div className='flex items-center justify-between p-3 border-b border-border/50 bg-muted shrink-0 h-12'>
				<span className='text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
					<MapIcon size={14} className='text-primary' />
					Map Layers
				</span>
				<button onClick={() => setIsOpen(false)} className='text-muted-foreground hover:text-foreground'>
					<PanelLeftClose size={16} />
				</button>
			</div>

			{/* Content */}
			<div className='flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5'>
				{sidebarGroups.map((group) => (
					<SidebarGroup
						key={group.id}
						label={group.label}
						items={group.items}
						visibility={visibility}
						// Adapter: SidebarGroup gives specific ID, ViewModel expects it
						onToggleItem={toggleLayer}
						// Adapter: Group toggle gives array of IDs
						onToggleGroup={(ids) => ids.forEach((id) => toggleLayer(id))}
						onFlyTo={onFlyTo}
					/>
				))}

				{sidebarGroups.length === 0 && (
					<div className='p-4 text-xs text-muted-foreground italic text-center'>No markers or paths found.</div>
				)}
			</div>
		</div>
	);
};

// ----------------------------------------------------------------------
// CONTENT WRAPPER
// ----------------------------------------------------------------------
const MiniMapContent = ({ data, bounds, imageUrl }) => {
	const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar closed by default for minimap
	const [flyToTarget, setFlyToTarget] = useState(null);

	// 1. Adapt Data for ViewModel
	const viewModelData = useMemo(() => {
		if (!data) return null;

		const safePaths = (data.paths || []).map((p, idx) => ({
			...p,
			name: p.name || `Path ${idx + 1}`,
		}));

		return {
			...data,
			sessions: safePaths,
		};
	}, [data]);

	// 2. Use Standard Atlas Hook
	// This hook initializes sessions to FALSE by default.
	const vm = useMapCanvas(viewModelData);

	if (!viewModelData) return null;

	return (
		<>
			<MapController bounds={bounds} flyToTarget={flyToTarget} />
			<MapZoomHandler referenceZoom={1} />
			<ImageOverlay url={imageUrl} bounds={bounds} />

			{/* LAYERS */}
			{/* The hook returns pre-filtered arrays based on visibility state */}
			<MapOverlays overlays={vm.visibleOverlays} />
			{vm.showAreas && <MapAreas areas={viewModelData.areas} />}
			<MapRecaps sessions={vm.visibleSessions} />
			<MapMarkers markers={vm.visibleMarkers} />

			{/* UI: Sidebar Toggle */}
			<div className='absolute top-3 left-3 z-[400]'>
				{!isSidebarOpen && (
					<button
						onClick={() => setSidebarOpen(true)}
						className='p-2 bg-background/90 backdrop-blur border border-border shadow-md rounded-md hover:bg-muted text-muted-foreground transition-colors'
						title='Open Layers'>
						<PanelLeftOpen size={18} />
					</button>
				)}
			</div>

			{/* UI: Sidebar */}
			<MiniSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} viewModel={vm} onFlyTo={setFlyToTarget} />
		</>
	);
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export const EntityMiniMap = ({ imageUrl, mapData }) => {
	// The measured bounds are stored together with the URL they came from, so
	// "still loading" is derived instead of being a second state that has to be
	// flipped from the effect's guard branch (react-hooks/set-state-in-effect).
	// This also removes a stale-image bug: if `imageUrl` changed while a previous
	// image was still decoding, the old dimensions could be applied to the new map.
	const [loaded, setLoaded] = useState(null);
	const [failedUrl, setFailedUrl] = useState(null);
	const containerRef = useRef(null);
	const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);

	// Normalize Data (parse string-or-object, then map to the render shape).
	const normalizedData = useMemo(() => normalizeMapData(parseMapData(mapData)), [mapData]);

	// Load Image
	useEffect(() => {
		if (!imageUrl) return;

		let cancelled = false;
		const img = new Image();
		img.onload = () => {
			if (cancelled) return;
			setLoaded({
				url: imageUrl,
				bounds: [
					[-img.height, 0],
					[0, img.width],
				],
			});
		};
		img.onerror = () => {
			if (!cancelled) setFailedUrl(imageUrl);
		};
		img.src = imageUrl;

		return () => {
			cancelled = true;
		};
	}, [imageUrl]);

	if (!imageUrl) return null;

	const dimensions = loaded?.url === imageUrl ? loaded.bounds : null;
	const isReady = !!dimensions;
	const loading = !isReady && failedUrl !== imageUrl;

	return (
		<div
			ref={containerRef}
			// CSS FIX:
			// 1. Removed "group" class -> Fixes hover ghosting
			// 2. Added "not-prose font-sans" -> Fixes styling interference
			className={clsx(
				'relative bg-background transition-all duration-300 not-prose font-sans text-foreground',
				isFullscreen ? 'h-screen w-screen p-0 m-0 fixed inset-0 z-[9999]' : 'mb-10'
			)}>
			{!isFullscreen && (
				<div className='flex items-center justify-between px-1'>
					<h3 className='font-serif text-lg mt-0 font-bold text-foreground mb-3 flex items-center gap-2'>
						<MapIcon size={16} className='text-primary' /> Tactical View
					</h3>
				</div>
			)}

			<div
				className={clsx(
					'relative overflow-hidden border border-border bg-dot-grid',
					isFullscreen ? 'h-full w-full rounded-none' : 'h-[500px] rounded-xl shadow-sm'
				)}>
				{isReady ? (
					<AtlasProvider>
						<MapContainer
							crs={L.CRS.Simple}
							bounds={dimensions}
							center={[dimensions[0][0] / 2, dimensions[1][1] / 2]}
							zoom={0}
							minZoom={-2}
							maxZoom={4}
							scrollWheelZoom={true}
							attributionControl={false}
							zoomControl={false} // Hidden standard zoom, using custom buttons or wheel
							style={{ height: '100%', width: '100%', background: 'transparent' }}>
							<MiniMapContent data={normalizedData} bounds={dimensions} imageUrl={imageUrl} />
						</MapContainer>
					</AtlasProvider>
				) : (
					<div className='absolute inset-0 flex items-center justify-center text-muted-foreground'>
						{loading ? <LoadingSpinner text='Loading Tactical Map...' /> : 'Error Loading Map'}
					</div>
				)}

				{/* Fullscreen Button */}
				<button
					onClick={toggleFullscreen}
					className='absolute top-4 right-4 z-[400] p-2.5 bg-background/90 backdrop-blur border border-border shadow-lg rounded-lg hover:bg-primary hover:text-white transition-colors text-foreground'
					title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
					{isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
				</button>
			</div>
		</div>
	);
};
