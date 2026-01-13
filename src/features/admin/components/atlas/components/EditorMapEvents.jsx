import { useMapEvents } from 'react-leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';

export default function EditorMapEvents() {
	const { state, actions } = useAtlasEditor();
	const { mode, selection, activeTool } = state;

	useMapEvents({
		click(e) {
			actions.closeContextMenu();
			// Precision fixed in Service Layer, but we pass raw here
			const pos = [e.latlng.lat, e.latlng.lng];

			// Drawing Logic
			if (mode === 'draw' && selection) {
				if (selection.type === 'path') {
					actions.appendPathPoint(selection.id, pos);
				} else if (selection.type === 'area') {
					actions.appendAreaPoint(selection.id, pos);
				}
			}
			// Creation Logic
			else if (activeTool === 'markers' && !selection) {
				const newMarker = {
					_id: crypto.randomUUID(),
					label: 'New Marker',
					lat: pos[0],
					lng: pos[1],
					category: 'default',
					color: '#d97706',
					scale: 1,
					variant: 'large',
					shape: 'pin',
				};
				actions.addMarker(newMarker);
			}
			// Deselect Logic
			else {
				actions.deselect();
			}
		},
	});
	return null;
}
