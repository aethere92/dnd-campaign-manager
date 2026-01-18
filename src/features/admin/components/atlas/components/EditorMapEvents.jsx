import { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';

export default function EditorMapEvents() {
	const { state, actions } = useAtlasEditor();
	const { mode, selection, activeTool } = state;
	const map = useMap();

	// HELPER: Measure the DOM to find the truth
	const updateVisualViewport = () => {
		const targetEl = document.getElementById('viewport-target');
		let centerPoint;

		if (targetEl) {
			// 1. Get exact screen coordinates of the crosshair
			const rect = targetEl.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			// 2. Ask Leaflet: "What Lat/Lng is under this screen pixel?"
			// containerPointToLatLng takes coordinates relative to the map container.
			// mouseEventToContainerPoint converts global screen (client) coordinates to map container coordinates.
			// We simulate a mouse event structure { clientX, clientY } to leverage Leaflet's built-in math.
			const containerPoint = map.mouseEventToContainerPoint({ clientX: centerX, clientY: centerY });
			centerPoint = map.containerPointToLatLng(containerPoint);
		} else {
			// Fallback if Reticle is hidden (Sidebar closed)
			centerPoint = map.getCenter();
		}

		actions.updateViewport(centerPoint, map.getZoom());
	};

	// Force update when selection changes (Sidebar toggles)
	// We use RequestAnimationFrame to ensure the DOM has updated (Reticle rendered)
	useEffect(() => {
		const handle = requestAnimationFrame(updateVisualViewport);
		return () => cancelAnimationFrame(handle);
	}, [selection]);

	useMapEvents({
		moveend: updateVisualViewport,
		zoomend: updateVisualViewport,

		click(e) {
			actions.closeContextMenu();
			const pos = [e.latlng.lat, e.latlng.lng];

			if (selection?.type === 'settings') {
				actions.deselect();
				return;
			}

			// ... (Keep existing creation logic exactly as is) ...
			if (mode === 'draw' && selection) {
				if (selection.type === 'path') {
					actions.appendPathPoint(selection.id, pos);
				} else if (selection.type === 'area') {
					actions.appendAreaPoint(selection.id, pos);
				}
			} else if (activeTool === 'markers' && !selection) {
				actions.addMarker({
					_id: crypto.randomUUID(),
					label: 'New Marker',
					lat: pos[0],
					lng: pos[1],
					category: 'default',
					color: '#d97706',
					scale: 1,
					variant: 'large',
					shape: 'pin',
				});
			} else if (activeTool === 'text' && !selection) {
				actions.addMarker({
					_id: crypto.randomUUID(),
					label: 'New Label',
					lat: pos[0],
					lng: pos[1],
					category: 'default',
					color: '#ffffff',
					scale: 1.5,
					variant: 'text',
					shape: 'pin',
				});
			} else if (activeTool === 'areas' && !selection) {
				actions.addArea({
					_id: crypto.randomUUID(),
					name: 'New Region',
					interiorColor: '#ff0000',
					points: [{ coordinates: pos }],
				});
			} else if (activeTool === 'paths' && !selection) {
				actions.addPath({
					_id: crypto.randomUUID(),
					name: 'New Path',
					color: '#d97706',
					points: [{ coordinates: pos, text: '' }],
				});
			} else if (activeTool === 'overlays' && !selection) {
				const size = 50;
				actions.addOverlay({
					_id: crypto.randomUUID(),
					name: 'New Overlay',
					image: '',
					bounds: [
						[pos[0] + size, pos[1] - size],
						[pos[0] - size, pos[1] + size],
					],
				});
			} else {
				actions.deselect();
			}
		},
		contextmenu(e) {
			e.originalEvent.preventDefault();
			actions.openContextMenu({
				type: 'map',
				position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
				latlng: { lat: e.latlng.lat, lng: e.latlng.lng },
			});
		},
	});
	return null;
}
