import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';

export default function EditMarkersLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { markers, selection, activeTool, visibility } = state;

	if (!visibility.markers) return null;

	return (
		<>
			{markers.map((m) => {
				const isSelected = selection?.type === 'marker' && selection.id === m._id;

				return (
					<Marker
						key={m._id}
						position={[m.lat, m.lng]}
						icon={resolveMarkerIcon(m)}
						draggable={true}
						opacity={isSelected ? 1 : 0.8}
						eventHandlers={{
							click: (e) => {
								L.DomEvent.stopPropagation(e);
								dispatch({ type: 'SELECT_ITEM', payload: { type: 'marker', id: m._id } });
							},
							dragend: (e) => {
								const { lat, lng } = e.target.getLatLng();
								dispatch({
									type: 'UPDATE_MARKER',
									id: m._id,
									updates: { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) },
								});
							},
						}}
					/>
				);
			})}
		</>
	);
}
