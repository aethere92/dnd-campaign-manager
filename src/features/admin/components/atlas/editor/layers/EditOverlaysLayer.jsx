import React from 'react';
import { ImageOverlay, Rectangle, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon } from '../components/VertexHandle';

export default function EditOverlaysLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { overlays, selection, activeTool, visibility } = state;
	const isInteractive = activeTool === 'overlays';

	const getUrl = (path) => (path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path}`);

	if (!visibility.overlays) return null;

	// --- LOGIC: HANDLE DRAG ---
	// Update logic for corner handles
	const onResize = (id, handle, newLat, newLng, oldBounds) => {
		// oldBounds is [[lat1, lng1], [lat2, lng2]]
		// usually [TL, BR] or [SW, NE]
		const [p1, p2] = oldBounds;

		let newBounds = [...oldBounds];

		if (handle === 'tl') {
			// Top Left: Modify Index 0
			newBounds = [[newLat, newLng], p2];
		} else if (handle === 'br') {
			// Bottom Right: Modify Index 1
			newBounds = [p1, [newLat, newLng]];
		} else if (handle === 'tr') {
			// Top Right: Lat from 0, Lng from 1
			// We want new point to be [newLat, newLng]
			// So P1 (TL) gets newLat, P2 (BR) gets newLng
			newBounds = [
				[newLat, p1[1]],
				[p2[0], newLng],
			];
		} else if (handle === 'bl') {
			// Bottom Left: Lat from 1, Lng from 0
			newBounds = [
				[p1[0], newLng],
				[newLat, p2[1]],
			];
		}

		dispatch({
			type: 'UPDATE_OVERLAY',
			id: id,
			updates: { bounds: newBounds },
		});
	};

	// Logic for moving the whole image
	const onMove = (id, newCenter, oldCenter, oldBounds) => {
		const latDiff = newCenter.lat - oldCenter.lat;
		const lngDiff = newCenter.lng - oldCenter.lng;

		const newBounds = [
			[oldBounds[0][0] + latDiff, oldBounds[0][1] + lngDiff],
			[oldBounds[1][0] + latDiff, oldBounds[1][1] + lngDiff],
		];

		dispatch({
			type: 'UPDATE_OVERLAY',
			id: id,
			updates: { bounds: newBounds },
		});
	};

	return (
		<>
			{overlays.map((overlay) => {
				const isSelected = selection?.type === 'overlay' && selection.id === overlay._id;

				// Bounds: [[lat1, lng1], [lat2, lng2]]
				const b = overlay.bounds;
				const centerLat = (b[0][0] + b[1][0]) / 2;
				const centerLng = (b[0][1] + b[1][1]) / 2;

				return (
					<React.Fragment key={overlay._id}>
						{/* THE IMAGE */}
						<ImageOverlay
							url={getUrl(overlay.image)}
							bounds={overlay.bounds}
							opacity={isSelected ? 0.8 : 1}
							interactive={false} // Let the invisible Rect handle clicks
						/>

						{/* CLICK / DRAG HIT BOX */}
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
									dispatch({ type: 'SELECT_ITEM', payload: { type: 'overlay', id: overlay._id } });
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
											onMove(overlay._id, newCenter, { lat: centerLat, lng: centerLng }, overlay.bounds);
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
										drag: (e) => {
											// Optional: Live update if performant enough, else use dragend
										},
										dragend: (e) => {
											const { lat, lng } = e.target.getLatLng();
											onResize(overlay._id, 'tl', lat, lng, overlay.bounds);
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
											onResize(overlay._id, 'br', lat, lng, overlay.bounds);
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
