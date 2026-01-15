// --- FILE: features/admin/components/atlas/layers/EditAreasLayer.jsx ---
import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon, createMidpointIcon, createLabelIcon } from '@/features/atlas/utils/markerUtils';
import { createMoveHandleIcon } from '../components/VertexHandle';
import { getRoundedPath } from '@/features/atlas/utils/pathUtils';
import { PatternDefs } from '../components/PatternDefs';

const getMidpoint = (p1, p2) => [
	(p1.coordinates[0] + p2.coordinates[0]) / 2,
	(p1.coordinates[1] + p2.coordinates[1]) / 2,
];

const getCentroid = (points) => {
	if (!points || points.length === 0) return [0, 0];
	let lat = 0,
		lng = 0;
	points.forEach((p) => {
		// Handle both object {coordinates: []} and raw array [] formats
		const c = p.coordinates || p;
		lat += c[0];
		lng += c[1];
	});
	return [lat / points.length, lng / points.length];
};

const useAreaIcons = () => {
	return useMemo(
		() => ({
			handleIcon: createHandleIcon(true),
			midpointIcon: createMidpointIcon(),
			moveIcon: createMoveHandleIcon(),
		}),
		[]
	);
};

const AreaItem = React.memo(
	({ area, isSelected, isInteractive, actions }) => {
		const [isHovered, setIsHovered] = useState(false);
		const { handleIcon, midpointIcon, moveIcon } = useAreaIcons();

		const polygonRef = useRef(null);
		const labelRef = useRef(null);
		const dragStartRef = useRef(null);

		const rawPoints = (area.points || []).map((p) => p.coordinates);

		// Geometry
		const positions = useMemo(() => {
			if (rawPoints.length < 3) return rawPoints;
			if (area.curviness > 0) return getRoundedPath(rawPoints, area.curviness, true);
			return rawPoints;
		}, [rawPoints, area.curviness]);

		// Geometric Center
		const geometricCenter = useMemo(() => getCentroid(area.points), [area.points]);

		// Label Position
		const labelCenter = useMemo(() => area.labelPosition || geometricCenter, [area.labelPosition, geometricCenter]);

		// Styles
		const fillStyle = useMemo(() => {
			let fillColor = area.interiorColor || '#ff0000';
			let fillOpacity = area.fillOpacity ?? 0.2;

			if (area.fillType === 'hatch' || area.fillType === 'dots') {
				const cleanColor = (area.interiorColor || '#d97706').replace('#', '');
				const safeOpacity = Math.round(fillOpacity * 100);
				const spacing = area.fillSpacing || (area.fillType === 'hatch' ? 10 : 16);
				const weight = area.fillWeight || (area.fillType === 'hatch' ? 2 : 1.5);
				const id = `pattern-${area.fillType}-${cleanColor}-${safeOpacity}-${spacing}-${weight}`;
				fillColor = `url(#${id})`;
				fillOpacity = 1;
			}
			return { fillColor, fillOpacity };
		}, [area.interiorColor, area.fillOpacity, area.fillType, area.fillSpacing, area.fillWeight]);

		const labelOpacity = useMemo(() => {
			if (!area.name) return 0;
			if (area.labelDisplay === 'always') return 1;
			if (isSelected) return 1;
			if (area.labelDisplay === 'hover' && isHovered) return 1;
			return 0;
		}, [area.name, area.labelDisplay, isSelected, isHovered]);

		const labelIcon = useMemo(
			() =>
				createLabelIcon(area.name, {
					color: area.labelColor,
					fontSize: area.fontSize,
					rotation: area.textRotation,
					bgColor: area.labelBgColor,
					bgOpacity: area.labelBgOpacity,
					hasBorder: area.labelHasBorder,
					borderRadius: area.labelRadius,
					borderColor: area.labelBorderColor,
					paddingX: area.paddingX,
					paddingY: area.paddingY,
					isSelected: isSelected && isInteractive,
				}),
			[area, isSelected, isInteractive]
		);

		// --- General Handlers ---
		const onAreaClick = useCallback(
			(e) => {
				if (!isInteractive) return;
				L.DomEvent.stopPropagation(e);
				actions.selectItem('area', area._id);
			},
			[isInteractive, area._id, actions]
		);

		const onCtxMenu = useCallback(
			(e) => {
				L.DomEvent.stopPropagation(e);
				e.originalEvent.preventDefault();
				actions.openContextMenu({
					type: 'entity',
					position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
					target: { type: 'area', id: area._id, data: area },
				});
			},
			[area, actions]
		);

		const handleLabelDrag = useCallback(
			(e) => {
				const { lat, lng } = e.target.getLatLng();
				actions.updateArea(area._id, { labelPosition: [lat, lng] });
			},
			[area._id, actions]
		);

		// --- SHAPE MOVE HANDLERS (Whole Polygon) ---
		const onMoveStart = useCallback(
			(e) => {
				dragStartRef.current = {
					type: 'move',
					startLatLng: e.target.getLatLng(),
					initialVisualPoints: positions.map((p) => [...p]),
					initialLabelPos: [...labelCenter],
				};
			},
			[positions, labelCenter]
		);

		const onMoveDrag = useCallback((e) => {
			if (!dragStartRef.current || dragStartRef.current.type !== 'move' || !polygonRef.current) return;

			const currentLatLng = e.target.getLatLng();
			const start = dragStartRef.current.startLatLng;
			const latDiff = currentLatLng.lat - start.lat;
			const lngDiff = currentLatLng.lng - start.lng;

			const newVisualPoints = dragStartRef.current.initialVisualPoints.map((p) => [p[0] + latDiff, p[1] + lngDiff]);
			polygonRef.current.setLatLngs(newVisualPoints);

			if (labelRef.current) {
				const lStart = dragStartRef.current.initialLabelPos;
				labelRef.current.setLatLng([lStart[0] + latDiff, lStart[1] + lngDiff]);
			}
		}, []);

		const onMoveEnd = useCallback(
			(e) => {
				if (!dragStartRef.current || dragStartRef.current.type !== 'move') return;
				const endLatLng = e.target.getLatLng();
				const start = dragStartRef.current.startLatLng;
				const latDiff = endLatLng.lat - start.lat;
				const lngDiff = endLatLng.lng - start.lng;

				const newPoints = area.points.map((p) => ({
					...p,
					coordinates: [p.coordinates[0] + latDiff, p.coordinates[1] + lngDiff],
				}));

				const updates = { points: newPoints };
				if (area.labelPosition) {
					updates.labelPosition = [area.labelPosition[0] + latDiff, area.labelPosition[1] + lngDiff];
				}

				actions.updateArea(area._id, updates);
				dragStartRef.current = null;
			},
			[area._id, area.points, area.labelPosition, actions]
		);

		// --- VERTEX MOVE HANDLERS (Single Point) ---

		const onVertexDragStart = useCallback(() => {
			// Snapshot the raw control points
			dragStartRef.current = {
				type: 'vertex',
				rawPoints: area.points.map((p) => [...p.coordinates]),
			};
		}, [area.points]);

		const onVertexDrag = useCallback(
			(e, index) => {
				if (!dragStartRef.current || dragStartRef.current.type !== 'vertex' || !polygonRef.current) return;

				const latlng = e.target.getLatLng();

				// 1. Update the specific point in our temporary array
				const currentPoints = dragStartRef.current.rawPoints;
				currentPoints[index] = [latlng.lat, latlng.lng];

				// 2. Re-calculate Smoothing (if enabled)
				let visualPoints = currentPoints;
				if (area.curviness > 0) {
					visualPoints = getRoundedPath(currentPoints, area.curviness, true);
				}

				// 3. Imperative Update
				polygonRef.current.setLatLngs(visualPoints);

				// 4. Update Label Centroid (if dynamic)
				// If user hasn't manually pinned the label, it should move with the shape
				if (!area.labelPosition && labelRef.current) {
					const newCenter = getCentroid(currentPoints);
					labelRef.current.setLatLng(newCenter);
				}
			},
			[area.curviness, area.labelPosition]
		);

		const onVertexDragEnd = useCallback(
			(e, index) => {
				const latlng = e.target.getLatLng();
				actions.updateAreaPoint(area._id, index, [latlng.lat, latlng.lng]);
				dragStartRef.current = null;
			},
			[area._id, actions]
		);

		if (positions.length === 0) return null;

		return (
			<React.Fragment>
				<Polygon
					ref={polygonRef}
					positions={positions}
					pathOptions={{
						color: area.borderStyle === 'none' ? 'transparent' : area.lineColor || '#d97706',
						fillColor: fillStyle.fillColor,
						fillOpacity: fillStyle.fillOpacity,
						weight: area.weight || 2,
						dashArray: area.borderStyle === 'dashed' ? '10, 10' : area.borderStyle === 'dotted' ? '2, 6' : null,
						lineJoin: 'round',
					}}
					eventHandlers={{
						click: onAreaClick,
						contextmenu: onCtxMenu,
						mouseover: () => setIsHovered(true),
						mouseout: () => setIsHovered(false),
					}}
				/>

				{area.name && labelOpacity > 0 && (
					<Marker
						ref={labelRef}
						position={labelCenter}
						icon={labelIcon}
						draggable={isSelected && isInteractive}
						opacity={labelOpacity}
						zIndexOffset={100}
						eventHandlers={{
							click: onAreaClick,
							dragend: handleLabelDrag,
						}}
					/>
				)}

				{isSelected && (
					<>
						<Marker
							position={geometricCenter}
							draggable={true}
							icon={moveIcon}
							zIndexOffset={1000}
							eventHandlers={{
								dragstart: onMoveStart,
								drag: onMoveDrag,
								dragend: onMoveEnd,
								click: (e) => L.DomEvent.stopPropagation(e),
							}}
						/>

						{area.points.map((pt, idx) => (
							<React.Fragment key={`v-${idx}`}>
								<Marker
									position={pt.coordinates}
									icon={handleIcon}
									draggable={true}
									eventHandlers={{
										dragstart: onVertexDragStart,
										drag: (e) => onVertexDrag(e, idx),
										dragend: (e) => onVertexDragEnd(e, idx),
										contextmenu: (e) => {
											L.DomEvent.stopPropagation(e);
											actions.deleteAreaPoint(area._id, idx);
										},
										click: (e) => L.DomEvent.stopPropagation(e),
									}}
								/>
								<Marker
									position={getMidpoint(pt, area.points[(idx + 1) % area.points.length])}
									icon={midpointIcon}
									eventHandlers={{
										click: (e) => {
											L.DomEvent.stopPropagation(e);
											actions.insertAreaPoint(
												area._id,
												idx,
												getMidpoint(pt, area.points[(idx + 1) % area.points.length])
											);
										},
									}}
								/>
							</React.Fragment>
						))}
					</>
				)}
			</React.Fragment>
		);
	},
	(prev, next) => {
		if (prev.area !== next.area) return false;
		if (prev.isInteractive !== next.isInteractive) return false;
		if (prev.isSelected !== next.isSelected) return false;
		return true;
	}
);

export default function EditAreasLayer() {
	const { state, actions } = useAtlasEditor();
	const { areas, selection, activeTool, visibility } = state;

	if (!visibility.areas) return null;

	const isInteractive = activeTool === 'areas' || activeTool === 'select';

	return (
		<>
			<PatternDefs areas={areas} />
			{areas.map((area) => (
				<AreaItem
					key={area._id}
					area={area}
					isSelected={selection?.type === 'area' && selection.id === area._id}
					isInteractive={isInteractive}
					actions={actions}
				/>
			))}
		</>
	);
}
