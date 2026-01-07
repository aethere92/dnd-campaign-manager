import React from 'react';
import { Polygon, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon } from '../components/VertexHandle';

export default function EditAreasLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { areas, selection, activeTool } = state;
	const isInteractive = activeTool === 'areas';

	return (
		<>
			{areas.map((area) => {
				const isSelected = selection?.type === 'area' && selection.id === area._id;
				const positions = (area.points || []).map((p) => p.coordinates);

				// --- FIX: CRITICAL CRASH PREVENTION ---
				// Leaflet Polygon throws error if rendered with < 3 points (or 0) when a Tooltip is attached.
				// We only render the polygon shape if it has valid geometry.
				const hasValidGeometry = positions.length > 0;

				return (
					<React.Fragment key={area._id}>
						{hasValidGeometry && (
							<Polygon
								positions={positions}
								pathOptions={{
									color: area.lineColor || 'transparent',
									fillColor: area.interiorColor || '#ff0000',
									fillOpacity: isSelected ? 0.6 : 0.3,
									weight: 2,
								}}
								eventHandlers={{
									click: (e) => {
										if (!isInteractive) return;
										L.DomEvent.stopPropagation(e);
										dispatch({ type: 'SELECT_ITEM', payload: { type: 'area', id: area._id } });
									},
								}}>
								{/* Only show label if we have enough points for a center */}
								{positions.length > 2 && (
									<Tooltip
										permanent
										direction='center'
										className='bg-transparent border-0 shadow-none text-white font-bold text-center'>
										<div style={{ transform: `rotate(${area.textRotation || 0}deg)` }}>{area.name}</div>
									</Tooltip>
								)}
							</Polygon>
						)}

						{/* Render Handles even if Polygon is invisible (so we can see points as we draw) */}
						{isSelected &&
							(area.points || []).map((pt, idx) => (
								<Marker
									key={`${area._id}-pt-${idx}`}
									position={pt.coordinates}
									icon={createHandleIcon(true)}
									draggable={true}
									eventHandlers={{
										dragend: (e) => {
											const { lat, lng } = e.target.getLatLng();
											dispatch({
												type: 'UPDATE_AREA_POINT',
												id: area._id,
												index: idx,
												coordinates: [Number(lat.toFixed(4)), Number(lng.toFixed(4))],
											});
										},
										click: (e) => L.DomEvent.stopPropagation(e),
									}}
								/>
							))}
					</React.Fragment>
				);
			})}
		</>
	);
}
