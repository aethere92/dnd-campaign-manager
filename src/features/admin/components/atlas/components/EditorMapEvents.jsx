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
			const rect = targetEl.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const containerPoint = map.mouseEventToContainerPoint({ clientX: centerX, clientY: centerY });
			centerPoint = map.containerPointToLatLng(containerPoint);
		} else {
			centerPoint = map.getCenter();
		}

		actions.updateViewport(centerPoint, map.getZoom());
	};

	// Force update when selection changes
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

			// 1. Handle Settings Selection (Safe check)
			if (selection && selection.type === 'settings') {
				actions.deselect();
				return;
			}

			// 2. DRAWING MODE (Appending points to existing shape)
			if (mode === 'draw' && selection) {
				if (selection.type === 'path') {
					actions.appendPathPoint(selection.id, pos);
				} else if (selection.type === 'area') {
					actions.appendAreaPoint(selection.id, pos);
				} else if (selection.type === 'fog') {
					// Append point to Fog Shape
					// selection.data might be stale, so we rely on the reducer to handle the append logic usually,
					// or we pass the new array.
					const currentPoints = selection.data?.points || [];
					actions.updateFogShape(selection.id, {
						points: [...currentPoints, pos],
					});
				}
				return; // Stop here if we processed a draw event
			}

			// 3. CREATION MODE (Starting new shapes)
			// Only runs if we are NOT selecting something (selection is null)
			if (!selection) {
				if (activeTool === 'markers') {
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
				} else if (activeTool === 'text') {
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
				} else if (activeTool === 'areas') {
					actions.addArea({
						_id: crypto.randomUUID(),
						name: 'New Region',
						interiorColor: '#ff0000',
						points: [{ coordinates: pos }],
					});
				} else if (activeTool === 'paths') {
					actions.addPath({
						_id: crypto.randomUUID(),
						name: 'New Path',
						color: '#d97706',
						points: [{ coordinates: pos, text: '' }],
					});
				} else if (activeTool === 'overlays') {
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
				} else if (activeTool === 'fog') {
					// START FOG SHAPE
					const newId = crypto.randomUUID();
					actions.addFogShape({
						id: newId,
						points: [pos],
					});
					// Note: addFogShape in reducer automatically sets mode='draw' and selection
				} else {
					// If no tool is active and we clicked empty space, deselect
					actions.deselect();
				}
			} else {
				// If we have a selection but mode is NOT draw (e.g. selected a marker), clicking map deselects
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
