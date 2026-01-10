import React, { useMemo } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon } from '../components/VertexHandle';

export default function EditPathsLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { paths, selection, activeTool, visibility } = state;

	const isInteractive = activeTool === 'paths';

	if (!visibility.paths) return null;

	return (
		<>
			{paths.map((path) => {
				const isSelected = selection?.type === 'path' && selection.id === path._id;

				// Memoize positions array to prevent Polyline flicker
				const positions = useMemo(() => path.points.map((p) => p.coordinates), [path.points]);

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
									dashArray: path.dashArray || null, // Respect styling
									lineCap: 'round',
									lineJoin: 'round',
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

						{/* Vertices: Only render when selected to save DOM nodes */}
						{isSelected &&
							path.points.map((pt, idx) => {
								const hasText = !!pt.text;
								return (
									<Marker
										key={`${path._id}-pt-${idx}`}
										position={pt.coordinates}
										icon={createHandleIcon(true, hasText)}
										draggable={true}
										eventHandlers={{
											// Optimized drag: only dispatch on dragend to save renders
											// Real-time visual feedback is handled by Leaflet internally for the marker
											// We accept the line will lag slightly behind marker during drag until drop
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
												dispatch({
													type: 'SELECT_ITEM',
													payload: { type: 'path', id: path._id, index: idx },
												});
											},
										}}>
										{hasText && (
											<Popup autoClose={false} closeButton={false} offset={[0, -5]}>
												<span className='text-xs font-semibold'>{pt.text.substring(0, 30)}...</span>
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
