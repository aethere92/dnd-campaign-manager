import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon } from '../components/VertexHandle';

export default function EditPathsLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { paths, selection, activeTool } = state;

	const isInteractive = activeTool === 'paths';

	return (
		<>
			{paths.map((path) => {
				const isSelected = selection?.type === 'path' && selection.id === path._id;
				const positions = path.points.map((p) => p.coordinates);

				// Skip empty paths to prevent rendering issues
				if (positions.length === 0 && !isSelected) return null;

				return (
					<React.Fragment key={path._id}>
						{positions.length > 0 && (
							<Polyline
								positions={positions}
								pathOptions={{
									color: path.lineColor || '#d97706',
									weight: isSelected ? 5 : 3,
									opacity: path.opacity || 0.7,
									dashArray: path.dashArray,
								}}
								eventHandlers={{
									click: (e) => {
										if (!isInteractive) return;
										L.DomEvent.stopPropagation(e);
										dispatch({ type: 'SELECT_ITEM', payload: { type: 'path', id: path._id } });
									},
								}}
							/>
						)}

						{/* Vertices/Nodes */}
						{isSelected &&
							path.points.map((pt, idx) => {
								const hasText = !!pt.text;
								return (
									<Marker
										key={`${path._id}-pt-${idx}`}
										position={pt.coordinates}
										icon={createHandleIcon(true, hasText)} // Blue if it has text
										draggable={true}
										eventHandlers={{
											dragend: (e) => {
												const { lat, lng } = e.target.getLatLng();
												dispatch({
													type: 'UPDATE_PATH_POINT',
													id: path._id,
													index: idx,
													updates: { coordinates: [Number(lat.toFixed(4)), Number(lng.toFixed(4))] },
												});
											},
											click: (e) => {
												L.DomEvent.stopPropagation(e);
												// Select this specific point to edit text
												dispatch({
													type: 'SELECT_ITEM',
													payload: { type: 'path', id: path._id, index: idx },
												});
											},
										}}>
										{/* Preview text on hover */}
										{hasText && (
											<Popup autoClose={false} closeButton={false}>
												{pt.text}
											</Popup>
										)}
									</Marker>
								);
							})}
					</React.Fragment>
				);
			})}
		</>
	);
}
