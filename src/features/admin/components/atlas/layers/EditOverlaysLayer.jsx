import React from 'react';
import { ImageOverlay, Rectangle, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon } from '../components/VertexHandle';

export default function EditOverlaysLayer() {
	const { state, actions } = useAtlasEditor();
	const { overlays, selection, activeTool, visibility } = state;
	const isInteractive = activeTool === 'overlays' || activeTool === 'select';

	// FIX: Robust URL resolver that handles null/undefined/non-strings
	const getUrl = (path) => {
		if (!path || typeof path !== 'string') return '';
		return path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path}`;
	};

	if (!visibility.overlays) return null;

	return (
		<>
			{overlays.map((overlay) => {
				const isSelected = selection?.type === 'overlay' && selection.id === overlay._id;
				const imagePath = getUrl(overlay.image);

				// Bounds: [[lat1, lng1], [lat2, lng2]]
				const b = overlay.bounds;
				// Safety check for bounds to prevent arithmetic crash
				if (!b || b.length < 2 || !b[0] || !b[1]) return null;

				const centerLat = (b[0][0] + b[1][0]) / 2;
				const centerLng = (b[0][1] + b[1][1]) / 2;

				return (
					<React.Fragment key={overlay._id}>
						{/* IMAGE - Only render if we have a path */}
						{imagePath && (
							<ImageOverlay
								url={imagePath}
								bounds={overlay.bounds}
								opacity={isSelected ? 0.8 : 1}
								interactive={false}
							/>
						)}

						{/* HIT BOX */}
						<Rectangle
							bounds={overlay.bounds}
							pathOptions={{
								color: isSelected ? '#3b82f6' : 'transparent',
								weight: 2,
								fillOpacity: isSelected ? 0.1 : 0,
								dashArray: '5, 5',
							}}
							eventHandlers={{
								click: (e) => {
									if (!isInteractive) return;
									L.DomEvent.stopPropagation(e);
									actions.selectItem('overlay', overlay._id);
								},
							}}
						/>

						{/* HANDLES (Only when selected) */}
						{isSelected && (
							<>
								{/* CENTER MOVE HANDLE */}
								<Marker
									position={[centerLat, centerLng]}
									draggable={true}
									icon={L.divIcon({
										className: 'move-handle',
										html: '<div style="width: 24px; height: 24px; background: rgba(59, 130, 246, 0.5); border: 2px solid white; border-radius: 4px; cursor: move; display: flex; align-items: center; justify-content: center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 12h20L12 2zm0 20l10-10H2l10 10z"/></svg></div>',
										iconSize: [24, 24],
										iconAnchor: [12, 12],
									})}
									eventHandlers={{
										dragend: (e) => {
											const newCenter = e.target.getLatLng();
											actions.moveOverlay(overlay._id, newCenter, { lat: centerLat, lng: centerLng }, overlay.bounds);
										},
										click: (e) => L.DomEvent.stopPropagation(e),
									}}
								/>

								{/* RESIZE HANDLES */}
								{/* Top Left */}
								<Marker
									position={b[0]}
									draggable={true}
									icon={createHandleIcon(true, true)}
									eventHandlers={{
										dragend: (e) => {
											const { lat, lng } = e.target.getLatLng();
											actions.resizeOverlay(overlay._id, 'tl', lat, lng, overlay.bounds);
										},
										click: (e) => L.DomEvent.stopPropagation(e),
									}}
								/>
								{/* Bottom Right */}
								<Marker
									position={b[1]}
									draggable={true}
									icon={createHandleIcon(true, true)}
									eventHandlers={{
										dragend: (e) => {
											const { lat, lng } = e.target.getLatLng();
											actions.resizeOverlay(overlay._id, 'br', lat, lng, overlay.bounds);
										},
										click: (e) => L.DomEvent.stopPropagation(e),
									}}
								/>
							</>
						)}
					</React.Fragment>
				);
			})}
		</>
	);
}
