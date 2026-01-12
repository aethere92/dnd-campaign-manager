import React, { useMemo } from 'react';
import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createPathHandleIcon, createPathMidpointIcon } from '@/features/atlas/utils/markerUtils';
import { getSmoothPath } from '@/features/atlas/utils/pathUtils';

// Helper to find center between two coords
const getMidpoint = (p1, p2) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

const PathItem = ({ path, isSelected, isInteractive, dispatch }) => {
	const rawPositions = path.points.map((p) => p.coordinates);

	// Calculate Smooth Geometry for Display
	const positions = useMemo(() => {
		if (path.curviness > 0 && rawPositions.length > 1) {
			return getSmoothPath(rawPositions, path.curviness);
		}
		return rawPositions;
	}, [rawPositions, path.curviness]);

	if (positions.length === 0 && !isSelected) return null;

	return (
		<React.Fragment>
			{/* 1. The Visible Line */}
			{positions.length > 0 && (
				<Polyline
					positions={positions}
					pathOptions={{
						color: path.color || '#d97706',
						weight: isSelected ? (path.weight || 5) + 2 : path.weight || 5,
						opacity: path.opacity || 1,
						dashArray: path.dashArray || null,
						lineCap: 'round',
						lineJoin: 'round',
					}}
					eventHandlers={{
						click: (e) => {
							if (!isInteractive) return;
							L.DomEvent.stopPropagation(e);
							dispatch({ type: 'SELECT_ITEM', payload: { type: 'path', id: path._id } });
						},
					}}>
					{path.name && path.labelDisplay !== 'none' && (
						<Tooltip
							permanent={path.labelDisplay === 'always'}
							direction='center'
							className='path-tooltip'
							opacity={path.labelDisplay === 'hover' ? 0.9 : 1}>
							<span className='font-bold text-xs font-serif'>{path.name}</span>
						</Tooltip>
					)}
				</Polyline>
			)}

			{/* 2. EDITING UI (Only when selected) */}
			{isSelected && (
				<>
					{/* A. Vertex Handles (Existing Points) */}
					{path.points.map((pt, idx) => (
						<Marker
							key={`v-${idx}`}
							position={pt.coordinates}
							icon={createPathHandleIcon(false)} // Solid White/Black
							draggable={true}
							zIndexOffset={1000}
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
									// Select for text editing
									dispatch({
										type: 'SELECT_ITEM',
										payload: { type: 'path', id: path._id, index: idx },
									});
								},
								contextmenu: (e) => {
									L.DomEvent.stopPropagation(e);
									// Right Click to Delete
									dispatch({ type: 'DELETE_PATH_POINT', id: path._id, index: idx });
								},
							}}
						/>
					))}

					{/* B. Midpoint Handles (Ghost Points) */}
					{path.points.map((pt, idx) => {
						// Don't render after the last point
						if (idx === path.points.length - 1) return null;

						const nextPt = path.points[idx + 1];
						const mid = getMidpoint(pt.coordinates, nextPt.coordinates);

						return (
							<Marker
								key={`m-${idx}`}
								position={mid}
								icon={createPathMidpointIcon()} // Semi-transparent
								zIndexOffset={900}
								opacity={0.6}
								eventHandlers={{
									click: (e) => {
										L.DomEvent.stopPropagation(e);
										// Insert new point at index + 1
										dispatch({
											type: 'INSERT_PATH_POINT',
											id: path._id,
											index: idx + 1,
											coordinates: mid,
										});
									},
									dragstart: (e) => {
										// UX Polish: Dragging a ghost immediately creates it
										// (This is tricky in Leaflet without complex state,
										//  so click-to-create is safer for v1)
									},
								}}
							/>
						);
					})}
				</>
			)}
		</React.Fragment>
	);
};

export default function EditPathsLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { paths, selection, activeTool, visibility } = state;
	const isInteractive = activeTool === 'paths';

	if (!visibility.paths) return null;

	return (
		<>
			{paths.map((path) => (
				<PathItem
					key={path._id}
					path={path}
					isSelected={selection?.type === 'path' && selection.id === path._id}
					isInteractive={isInteractive}
					dispatch={dispatch}
				/>
			))}
		</>
	);
}
