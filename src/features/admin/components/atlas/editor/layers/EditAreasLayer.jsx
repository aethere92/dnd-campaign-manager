import React from 'react';
import { Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon } from '../components/VertexHandle';
import { createLabelIcon, createMidpointIcon } from '@/features/atlas/utils/markerUtils';

const getCentroid = (points) => {
	if (!points || points.length === 0) return [0, 0];
	let lat = 0,
		lng = 0;
	points.forEach((p) => {
		lat += p.coordinates[0];
		lng += p.coordinates[1];
	});
	return [lat / points.length, lng / points.length];
};

const getMidpoint = (p1, p2) => [
	(p1.coordinates[0] + p2.coordinates[0]) / 2,
	(p1.coordinates[1] + p2.coordinates[1]) / 2,
];

export default function EditAreasLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { areas, selection, activeTool, visibility } = state;
	const isInteractive = activeTool === 'areas';

	// 1. Check Visibility
	if (!visibility.areas) return null;

	return (
		<>
			{areas.map((area) => {
				const isSelected = selection?.type === 'area' && selection.id === area._id;
				const positions = (area.points || []).map((p) => p.coordinates);
				const hasValidGeometry = positions.length > 0;

				// Centroid for label default
				const center = area.labelPosition || getCentroid(area.points);

				return (
					<React.Fragment key={area._id}>
						{hasValidGeometry && (
							<Polygon
								positions={positions}
								pathOptions={{
									color: area.lineColor || 'transparent',
									fillColor: area.interiorColor || '#ff0000',
									// Use dynamic fillOpacity from data, default to logic if missing
									fillOpacity: area.fillOpacity ?? (isSelected ? 0.5 : 0.2),
									weight: 2,
								}}
								eventHandlers={{
									click: (e) => {
										if (!isInteractive) return;
										L.DomEvent.stopPropagation(e);
										dispatch({ type: 'SELECT_ITEM', payload: { type: 'area', id: area._id } });
									},
								}}
							/>
						)}

						{/* Label */}
						{hasValidGeometry && area.name && (
							<Marker
								position={center}
								icon={createLabelIcon(area.name, {
									color: area.labelColor,
									fontSize: area.fontSize,
									rotation: area.textRotation,
									bgColor: area.labelBgColor,
									bgOpacity: area.labelBgOpacity,
									isSelected: isSelected && isInteractive,
								})}
								draggable={isSelected && isInteractive}
								eventHandlers={{
									click: (e) => {
										if (!isInteractive) return;
										L.DomEvent.stopPropagation(e);
										dispatch({ type: 'SELECT_ITEM', payload: { type: 'area', id: area._id } });
									},
									dragend: (e) => {
										const { lat, lng } = e.target.getLatLng();
										dispatch({
											type: 'UPDATE_AREA',
											id: area._id,
											updates: { labelPosition: [Number(lat.toFixed(4)), Number(lng.toFixed(4))] },
										});
									},
								}}
							/>
						)}

						{/* EDIT MODE: Vertices & Midpoints */}
						{isSelected && (
							<>
								{area.points.map((pt, idx) => (
									<React.Fragment key={`${area._id}-v-${idx}`}>
										{/* Real Vertex */}
										<Marker
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
												contextmenu: (e) => {
													L.DomEvent.stopPropagation(e);
													if (confirm('Delete this point?')) {
														dispatch({
															type: 'DELETE_AREA_POINT',
															id: area._id,
															index: idx,
														});
													}
												},
												click: (e) => L.DomEvent.stopPropagation(e),
											}}
										/>

										{/* Midpoint (Add new vertex) - Skip last if not closed loop, but areas are usually closed */}
										{idx < area.points.length - 1 && (
											<Marker
												position={getMidpoint(pt, area.points[idx + 1])}
												icon={createMidpointIcon()}
												eventHandlers={{
													click: (e) => {
														L.DomEvent.stopPropagation(e);
														dispatch({
															type: 'INSERT_AREA_POINT',
															id: area._id,
															index: idx,
															coordinates: getMidpoint(pt, area.points[idx + 1]),
														});
													},
												}}
											/>
										)}
										{/* Closing Midpoint (Last to First) */}
										{idx === area.points.length - 1 && (
											<Marker
												position={getMidpoint(pt, area.points[0])}
												icon={createMidpointIcon()}
												eventHandlers={{
													click: (e) => {
														L.DomEvent.stopPropagation(e);
														dispatch({
															type: 'INSERT_AREA_POINT',
															id: area._id,
															index: idx,
															coordinates: getMidpoint(pt, area.points[0]),
														});
													},
												}}
											/>
										)}
									</React.Fragment>
								))}
							</>
						)}
					</React.Fragment>
				);
			})}
		</>
	);
}
