/* --- FILE: features/admin/components/atlas/layers/EditPathsLayer.jsx --- */
import React, { useMemo, useCallback, useRef, useState } from 'react';
import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createPathHandleIcon, createPathMidpointIcon } from '@/features/atlas/utils/markerUtils';
import { getSmoothPath } from '@/features/atlas/utils/pathUtils';
import { TextAlongPath } from '@/features/atlas/components/layers/TextAlongPath';

const getMidpoint = (p1, p2) => [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

const PathItem = React.memo(
	({ path, isSelected, selectedPointIndex, isInteractive, actions }) => {
		const polylineRef = useRef(null);
		const dragStartRef = useRef(null);
		const [isHovered, setIsHovered] = useState(false);

		// Geometry
		const rawPositions = useMemo(() => path.points.map((p) => p.coordinates), [path.points]);
		const positions = useMemo(() => {
			if (path.curviness > 0 && rawPositions.length >= 3) {
				return getSmoothPath(rawPositions, path.curviness);
			}
			return rawPositions;
		}, [rawPositions, path.curviness]);

		// FIX: Safe Click Handler
		const onClick = useCallback(
			(e) => {
				if (!isInteractive) return;
				L.DomEvent.stopPropagation(e);
				L.DomEvent.preventDefault(e);

				requestAnimationFrame(() => {
					actions.selectItem('path', path._id || path.id);
				});
			},
			[isInteractive, path._id, path.id, actions]
		);

		// --- DRAG HANDLERS ---
		const onVertexDragStart = useCallback(() => {
			dragStartRef.current = {
				rawPoints: path.points.map((p) => [...p.coordinates]),
			};
		}, [path.points]);

		const onVertexDrag = useCallback(
			(e, index) => {
				if (!dragStartRef.current || !polylineRef.current) return;
				const latlng = e.target.getLatLng();
				const currentPoints = dragStartRef.current.rawPoints;
				currentPoints[index] = [latlng.lat, latlng.lng];

				let visualPoints = currentPoints;
				if (path.curviness > 0 && currentPoints.length >= 3) {
					visualPoints = getSmoothPath(currentPoints, path.curviness);
				}
				polylineRef.current.setLatLngs(visualPoints);
			},
			[path.curviness]
		);

		const onVertexDragEnd = useCallback(
			(e, index) => {
				const latlng = e.target.getLatLng();
				actions.updatePathPoint(path._id || path.id, index, { coordinates: [latlng.lat, latlng.lng] });
				dragStartRef.current = null;
			},
			[path._id, path.id, actions]
		);

		if (positions.length === 0 && !isSelected) return null;

		// Visibility
		const tooltipClass = path.labelStyle === 'ghost' ? 'leaflet-tooltip-ghost' : 'leaflet-tooltip-box';
		const showTooltip = path.name && path.labelDisplay !== 'none' && !path.textAlongLine;

		let isTextVisible = false;
		if (path.textAlongLine && path.labelDisplay !== 'none') {
			if (path.labelDisplay === 'always') isTextVisible = true;
			else if (path.labelDisplay === 'hover') isTextVisible = isHovered || isSelected;
		}

		return (
			<React.Fragment>
				{positions.length > 0 && (
					<Polyline
						ref={polylineRef}
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
							click: onClick,
							mouseover: () => setIsHovered(true),
							mouseout: () => setIsHovered(false),
						}}>
						{showTooltip && (
							<Tooltip
								permanent={path.labelDisplay === 'always'}
								direction='center'
								className={tooltipClass}
								opacity={path.labelStyle === 'ghost' ? 1 : 0.9}>
								<span>{path.name}</span>
							</Tooltip>
						)}

						{path.textAlongLine && path.name && (
							<TextAlongPath
								layerRef={polylineRef}
								text={path.name}
								visible={isTextVisible}
								style={{
									color: '#ffffff',
									strokeColor: path.color || '#000',
									opacity: path.opacity || 1,
									fontSize: 12,
									fontWeight: 800,
								}}
							/>
						)}
					</Polyline>
				)}

				{isSelected && (
					<>
						{path.points.map((pt, idx) => (
							<Marker
								key={`v-${idx}`}
								position={pt.coordinates}
								icon={createPathHandleIcon(selectedPointIndex === idx, !!pt.text)}
								draggable={true}
								zIndexOffset={1000}
								eventHandlers={{
									dragstart: onVertexDragStart,
									drag: (e) => onVertexDrag(e, idx),
									dragend: (e) => onVertexDragEnd(e, idx),
									click: (e) => {
										L.DomEvent.stopPropagation(e);
										actions.selectItem('path', path._id || path.id, idx);
									},
									contextmenu: (e) => {
										L.DomEvent.stopPropagation(e);
										actions.deletePathPoint(path._id || path.id, idx);
									},
								}}
							/>
						))}
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
											actions.insertPathPoint(path._id || path.id, idx + 1, mid);
										},
									}}
								/>
							);
						})}
					</>
				)}
			</React.Fragment>
		);
	},
	(prev, next) => {
		if (prev.path !== next.path) return false;
		if (prev.isInteractive !== next.isInteractive) return false;
		if (prev.isSelected !== next.isSelected) return false;
		if (prev.selectedPointIndex !== next.selectedPointIndex) return false;
		return true;
	}
);

export default function EditPathsLayer() {
	const { state, actions } = useAtlasEditor();
	const { paths, selection, activeTool, visibility } = state;
	const isInteractive = activeTool === 'paths' || activeTool === 'select';

	if (!visibility.paths) return null;

	return (
		<>
			{paths.map((path) => (
				<PathItem
					key={path._id || path.id}
					path={path}
					isSelected={selection?.type === 'path' && selection.id === (path._id || path.id)}
					selectedPointIndex={
						selection?.type === 'path' && selection.id === (path._id || path.id) ? selection.index : undefined
					}
					isInteractive={isInteractive}
					actions={actions}
				/>
			))}
		</>
	);
}
