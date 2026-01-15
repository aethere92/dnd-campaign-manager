// --- FILE: components/EditorMapEvents.jsx ---
import { useMapEvents } from 'react-leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';

export default function EditorMapEvents() {
	const { state, actions } = useAtlasEditor();
	const { mode, selection, activeTool } = state;

	useMapEvents({
		click(e) {
			actions.closeContextMenu();
			const pos = [e.latlng.lat, e.latlng.lng];

			// 1. Drawing Logic (Append points to existing shapes)
			if (mode === 'draw' && selection) {
				if (selection.type === 'path') {
					actions.appendPathPoint(selection.id, pos);
				} else if (selection.type === 'area') {
					actions.appendAreaPoint(selection.id, pos);
				}
			}
			// 2. Creation Logic: MARKERS
			else if (activeTool === 'markers' && !selection) {
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
			}
			// 3. Creation Logic: TEXT LABELS
			else if (activeTool === 'text' && !selection) {
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
			}
			// 4. Creation Logic: AREAS
			else if (activeTool === 'areas' && !selection) {
				actions.addArea({
					_id: crypto.randomUUID(),
					name: 'New Region',
					interiorColor: '#ff0000',
					points: [{ coordinates: pos }],
				});
			}
			// 5. Creation Logic: PATHS
			else if (activeTool === 'paths' && !selection) {
				actions.addPath({
					_id: crypto.randomUUID(),
					name: 'New Path',
					color: '#d97706',
					points: [{ coordinates: pos, text: '' }],
				});
			}
			// 6. Creation Logic: OVERLAYS (Added)
			else if (activeTool === 'overlays' && !selection) {
				const size = 50; // Creates a 100x100 unit box
				actions.addOverlay({
					_id: crypto.randomUUID(),
					name: 'New Overlay',
					image: '', // User will set this in the form
					bounds: [
						[pos[0] + size, pos[1] - size], // Top Left
						[pos[0] - size, pos[1] + size], // Bottom Right
					],
				});
			}
			// 7. Select Mode / Deselect Logic
			else {
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
