// --- FILE: layers/EditOverlaysLayer.jsx ---
import React from 'react';
import { ImageOverlay, Rectangle, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon, createMoveHandleIcon } from '../components/VertexHandle'; // Import new icon

export default function EditOverlaysLayer() {
	const { state, actions } = useAtlasEditor();
	const { overlays, selection, activeTool, visibility } = state;

	// Universal Select Logic
	const isInteractive = activeTool === 'overlays' || activeTool === 'select';

	// ... helper
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
				const b = overlay.bounds;
				if (!b || b.length < 2 || !b[0] || !b[1]) return null;

				const centerLat = (b[0][0] + b[1][0]) / 2;
				const centerLng = (b[0][1] + b[1][1]) / 2;

				return (
					<React.Fragment key={overlay._id}>
						{imagePath && (
							<ImageOverlay
								url={imagePath}
								bounds={overlay.bounds}
								opacity={isSelected ? 0.8 : 1}
								interactive={false}
							/>
						)}

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

						{isSelected && (
							<>
								{/* CENTER MOVE HANDLE - Updated to use shared icon */}
								<Marker
									position={[centerLat, centerLng]}
									draggable={true}
									icon={createMoveHandleIcon()}
									eventHandlers={{
										dragend: (e) => {
											const newCenter = e.target.getLatLng();
											actions.moveOverlay(overlay._id, newCenter, { lat: centerLat, lng: centerLng }, overlay.bounds);
										},
										click: (e) => L.DomEvent.stopPropagation(e),
									}}
								/>

								{/* RESIZE HANDLES (Unchanged) */}
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
