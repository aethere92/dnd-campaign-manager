import { useMapEvents } from 'react-leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';

export default function EditorMapEvents() {
	const { state, dispatch } = useAtlasEditor();
	const { mode, selection, activeTool } = state;

	useMapEvents({
		click(e) {
			const pos = { lat: Number(e.latlng.lat.toFixed(4)), lng: Number(e.latlng.lng.toFixed(4)) };

			// Drawing Logic
			if (mode === 'draw' && selection) {
				if (selection.type === 'path') {
					dispatch({ type: 'APPEND_PATH_POINT', id: selection.id, coordinates: [pos.lat, pos.lng] });
				} else if (selection.type === 'area') {
					dispatch({ type: 'APPEND_AREA_POINT', id: selection.id, coordinates: [pos.lat, pos.lng] });
				}
			}
			// Creation Logic (if we decide to allow click-to-create in empty space)
			else if (activeTool === 'markers' && !selection) {
				// Optional: Create marker on empty click
				const newMarker = {
					_id: crypto.randomUUID(),
					label: 'New Marker',
					lat: pos.lat,
					lng: pos.lng,
					category: 'default',
					type: 'place',
				};
				dispatch({ type: 'ADD_MARKER', payload: newMarker });
			}
			// Deselect Logic
			else {
				dispatch({ type: 'SELECT_ITEM', payload: null });
			}
		},
	});
	return null;
}
