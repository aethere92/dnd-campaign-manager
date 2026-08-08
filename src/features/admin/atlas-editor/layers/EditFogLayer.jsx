import React from 'react';
import { Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';

// Standard Handle
const handleIcon = L.divIcon({
	className: 'vertex-handle',
	html: `<div style="width: 10px; height: 10px; background: white; border: 2px solid #6366f1; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
	iconSize: [10, 10],
	iconAnchor: [5, 5],
});

const startHandleIcon = L.divIcon({
	className: 'vertex-handle-start',
	html: `<div style="width: 14px; height: 14px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.5); cursor: pointer;"></div>`,
	iconSize: [14, 14],
	iconAnchor: [7, 7],
});

export const EditFogLayer = () => {
	const { state, actions } = useAtlasEditor();
	const { fog, selection, activeTool } = state;

	if (activeTool !== 'fog' && selection?.type !== 'fog') return null;
	if (!fog.shapes) return null;

	return (
		<>
			{fog.shapes.map((shape) => {
				const isSelected = selection?.type === 'fog' && selection.id === shape.id;

				return (
					<React.Fragment key={shape.id}>
						<Polyline
							positions={shape.points}
							pathOptions={{
								color: isSelected ? '#6366f1' : '#ffffff',
								weight: 2,
								dashArray: '5, 5',
								opacity: 0.8,
								fill: false,
								interactive: false,
							}}
						/>

						{isSelected &&
							shape.points.map((pt, idx) => {
								// Logic: If it's the first point (idx 0), give it the "Close" handle
								const isStart = idx === 0;
								const icon = isStart ? startHandleIcon : handleIcon;

								return (
									<Marker
										key={`${shape.id}-${idx}`}
										position={pt}
										icon={icon}
										draggable={true}
										zIndexOffset={isStart ? 1000 : 0} // Keep start on top
										eventHandlers={{
											click: (e) => {
												L.DomEvent.stopPropagation(e);
												if (isStart) {
													// CLICKING START POINT -> CLOSE SHAPE / DESELECT
													actions.deselect();
												}
											},
											dragend: (e) => {
												const { lat, lng } = e.target.getLatLng();
												const newPoints = [...shape.points];
												newPoints[idx] = [lat, lng];
												actions.updateFogShape(shape.id, { points: newPoints });
											},
											contextmenu: (e) => {
												L.DomEvent.stopPropagation(e);
												const newPoints = shape.points.filter((_, i) => i !== idx);
												actions.updateFogShape(shape.id, { points: newPoints });
											},
										}}
									/>
								);
							})}
					</React.Fragment>
				);
			})}
		</>
	);
};
