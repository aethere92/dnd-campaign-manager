import React, { useMemo } from 'react';
import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createPathHandleIcon, createPathMidpointIcon } from '@/features/atlas/utils/markerUtils';
import { getSmoothPath } from '@/features/atlas/utils/pathUtils'; // Import the new math

const getMidpoint = (p1, p2) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

const PathItem = ({ path, isSelected, isInteractive, selection, actions }) => {
	// 1. Calculate Geometry
	const rawPositions = path.points.map((p) => p.coordinates);

	// 2. Smooth if needed
	const positions = useMemo(() => {
		// Only curve if we have at least 3 points and curviness > 0
		if (path.curviness > 0 && rawPositions.length >= 3) {
			// Map 0.1-1.0 input to a reasonable tension (0.1 is tight, 1.0 is loose)
			return getSmoothPath(rawPositions, path.curviness);
		}
		return rawPositions;
	}, [rawPositions, path.curviness]);

	if (positions.length === 0 && !isSelected) return null;

	// 3. Label Style
	const tooltipClass = path.labelStyle === 'ghost' ? 'leaflet-tooltip-ghost' : 'leaflet-tooltip-box';

	return (
		<React.Fragment>
			{/* The Line */}
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
							actions.selectItem('path', path._id);
						},
					}}>
					{path.name && path.labelDisplay !== 'none' && (
						<Tooltip
							permanent={path.labelDisplay === 'always'}
							direction='center'
							className={tooltipClass}
							opacity={path.labelStyle === 'ghost' ? 1 : 0.9}>
							<span>{path.name}</span>
						</Tooltip>
					)}
				</Polyline>
			)}

			{/* EDIT HANDLES - Only visible when selected */}
			{isSelected && (
				<>
					{/* Vertices */}
					{path.points.map((pt, idx) => {
						const hasText = !!pt.text && pt.text.trim().length > 0;
						const isPointSelected = selection?.index === idx;

						return (
							<Marker
								key={`v-${idx}`}
								position={pt.coordinates}
								icon={createPathHandleIcon(isPointSelected, hasText)}
								draggable={true}
								zIndexOffset={1000}
								eventHandlers={{
									dragend: (e) => {
										const { lat, lng } = e.target.getLatLng();
										actions.updatePathPoint(path._id, idx, { coordinates: [lat, lng] });
									},
									click: (e) => {
										L.DomEvent.stopPropagation(e);
										actions.selectItem('path', path._id, idx);
									},
									contextmenu: (e) => {
										L.DomEvent.stopPropagation(e);
										actions.deletePathPoint(path._id, idx);
									},
								}}
							/>
						);
					})}

					{/* Midpoints (Insert) */}
					{path.points.map((pt, idx) => {
						if (idx === path.points.length - 1) return null;
						const nextPt = path.points[idx + 1];
						const mid = getMidpoint(pt.coordinates, nextPt.coordinates);

						return (
							<Marker
								key={`m-${idx}`}
								position={mid}
								icon={createPathMidpointIcon()}
								zIndexOffset={900}
								opacity={0.6}
								eventHandlers={{
									click: (e) => {
										L.DomEvent.stopPropagation(e);
										actions.insertPathPoint(path._id, idx + 1, mid);
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
	const { state, actions } = useAtlasEditor();
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
					selection={selection}
					isInteractive={isInteractive}
					actions={actions}
				/>
			))}
		</>
	);
}
