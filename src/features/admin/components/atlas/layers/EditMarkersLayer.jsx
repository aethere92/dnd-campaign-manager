import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';

export default function EditMarkersLayer() {
	const { state, actions } = useAtlasEditor();
	const { markers, selection, visibility } = state;

	if (!visibility.markers) return null;

	return (
		<>
			{markers.map((m) => {
				const isSelected = selection?.type === 'marker' && selection.id === m._id;

				return (
					<Marker
						key={m._id}
						position={[m.lat, m.lng]}
						// Pass selection state to resolver for dashed border on text
						icon={resolveMarkerIcon({ ...m, isSelected })}
						draggable={true}
						opacity={isSelected ? 1 : 0.8}
						eventHandlers={{
							click: (e) => {
								L.DomEvent.stopPropagation(e);
								actions.selectItem('marker', m._id);
							},
							dragend: (e) => {
								const { lat, lng } = e.target.getLatLng();
								actions.updateMarker(m._id, { lat, lng });
							},
							contextmenu: (e) => {
								L.DomEvent.stopPropagation(e);
								e.originalEvent.preventDefault();
								actions.openContextMenu({
									type: 'entity',
									position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
									target: { type: 'marker', id: m._id, data: m },
								});
							},
						}}
					/>
				);
			})}
		</>
	);
}
