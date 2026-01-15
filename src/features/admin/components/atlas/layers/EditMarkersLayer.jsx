// --- FILE: layers/EditMarkersLayer.jsx ---
import React, { useMemo, useCallback } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';

const MarkerItem = React.memo(
	({ marker, isSelected, isInteractive, actions }) => {
		// Added isInteractive prop

		const icon = useMemo(() => resolveMarkerIcon({ ...marker, isSelected }), [marker, isSelected]);

		const onClick = useCallback(
			(e) => {
				// Allow selection if tool matches OR if we are in universal select mode
				if (!isInteractive) return;
				L.DomEvent.stopPropagation(e);
				actions.selectItem('marker', marker._id);
			},
			[marker._id, actions, isInteractive]
		);

		const onDragEnd = useCallback(
			(e) => {
				const { lat, lng } = e.target.getLatLng();
				actions.updateMarker(marker._id, { lat, lng });
			},
			[marker._id, actions]
		);

		const onCtxMenu = useCallback(
			(e) => {
				L.DomEvent.stopPropagation(e);
				e.originalEvent.preventDefault();
				actions.openContextMenu({
					type: 'entity',
					position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
					target: { type: 'marker', id: marker._id, data: marker },
				});
			},
			[marker, actions]
		);

		return (
			<Marker
				position={[marker.lat, marker.lng]}
				icon={icon}
				draggable={isSelected} // Only drag if selected
				opacity={isSelected ? 1 : 0.8}
				eventHandlers={{
					click: onClick,
					dragend: onDragEnd,
					contextmenu: onCtxMenu,
				}}
			/>
		);
	},
	(prev, next) => {
		return (
			prev.marker === next.marker && prev.isSelected === next.isSelected && prev.isInteractive === next.isInteractive
		);
	}
);

export default function EditMarkersLayer() {
	const { state, actions } = useAtlasEditor();
	const { markers, selection, visibility, activeTool } = state;

	if (!visibility.markers) return null;

	// Universal Select Logic
	const isInteractive = activeTool === 'markers' || activeTool === 'select' || activeTool === 'text';

	return (
		<>
			{markers.map((m) => (
				<MarkerItem
					key={m._id}
					marker={m}
					isSelected={selection?.type === 'marker' && selection.id === m._id}
					isInteractive={isInteractive}
					actions={actions}
				/>
			))}
		</>
	);
}
