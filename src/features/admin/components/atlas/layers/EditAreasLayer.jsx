import React, { useMemo, useState } from 'react';
import { Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';
import { createHandleIcon, createMidpointIcon, createLabelIcon } from '@/features/atlas/utils/markerUtils';
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
		lat += p.coordinates[0];
		lng += p.coordinates[1];
	});
	return [lat / points.length, lng / points.length];
};

const AreaItem = ({ area, selection, activeTool, actions }) => {
	const [isHovered, setIsHovered] = useState(false);

	const isSelected = selection?.type === 'area' && selection.id === area._id;
	const isInteractive = activeTool === 'areas';
	const rawPoints = (area.points || []).map((p) => p.coordinates);

	// 1. Geometry Calculation
	const positions = useMemo(() => {
		if (rawPoints.length < 3) return rawPoints;
		if (area.curviness > 0) return getRoundedPath(rawPoints, area.curviness, true);
		return rawPoints;
	}, [rawPoints, area.curviness]);

	const center = area.labelPosition || getCentroid(area.points);

	// 2. Pattern Logic
	let fillColor = area.interiorColor || '#ff0000';
	let fillOpacity = area.fillOpacity ?? 0.2;

	if (area.fillType === 'hatch' || area.fillType === 'dots') {
		const cleanColor = (area.interiorColor || '#d97706').replace('#', '');
		const safeOpacity = Math.round(fillOpacity * 100);
		fillColor = `url(#pattern-${area.fillType}-${cleanColor}-${safeOpacity})`;
		fillOpacity = 1;

		const spacing = area.fillSpacing || (area.fillType === 'hatch' ? 10 : 16);
		const weight = area.fillWeight || (area.fillType === 'hatch' ? 2 : 1.5);

		// MATCH THE ID GENERATION IN PATTERN DEFS EXACTLY
		const id = `pattern-${area.fillType}-${cleanColor}-${safeOpacity}-${spacing}-${weight}`;
		fillColor = `url(#${id})`;
		fillOpacity = 1;
	}

	// 3. Label Visibility
	let labelOpacity = 0;
	if (area.labelDisplay === 'always') labelOpacity = 1;
	else if (area.labelDisplay === 'hover' && (isHovered || isSelected)) labelOpacity = 1;
	if (isSelected) labelOpacity = 1;
	if (!area.name) labelOpacity = 0;

	// 4. MEMOIZED ICONS (CRITICAL FIX FOR DRAG)
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
		[
			area.name,
			area.labelColor,
			area.fontSize,
			area.textRotation,
			area.labelBgColor,
			area.labelBgOpacity,
			area.labelHasBorder,
			area.labelRadius,
			area.labelBorderColor,
			area.paddingX,
			area.paddingY,
			isSelected,
			isInteractive,
		]
	);

	const handleIcon = useMemo(() => createHandleIcon(true), []);
	const midpointIcon = useMemo(() => createMidpointIcon(), []);

	// 5. Handlers
	const handleLabelDrag = (e) => {
		const { lat, lng } = e.target.getLatLng();
		// Use requestAnimationFrame or debounce if this is still heavy,
		// but normally updating Redux/State on dragend is safer than drag
		actions.updateArea(area._id, { labelPosition: [lat, lng] });
	};

	return (
		<React.Fragment>
			{positions.length > 0 && (
				<Polygon
					positions={positions}
					pathOptions={{
						color: area.borderStyle === 'none' ? 'transparent' : area.lineColor || '#d97706',
						fillColor: fillColor,
						fillOpacity: fillOpacity,
						weight: area.weight || 2,
						dashArray: area.borderStyle === 'dashed' ? '10, 10' : area.borderStyle === 'dotted' ? '2, 6' : null,
						lineJoin: 'round',
					}}
					eventHandlers={{
						click: (e) => {
							if (!isInteractive) return;
							L.DomEvent.stopPropagation(e);
							actions.selectItem('area', area._id);
						},
						contextmenu: (e) => {
							L.DomEvent.stopPropagation(e);
							e.originalEvent.preventDefault();
							actions.openContextMenu({
								type: 'entity',
								position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
								target: { type: 'area', id: area._id, data: area },
							});
						},
						mouseover: () => setIsHovered(true),
						mouseout: () => setIsHovered(false),
					}}
				/>
			)}

			{/* Label Marker */}
			{area.name && labelOpacity > 0 && (
				<Marker
					position={center}
					icon={labelIcon}
					draggable={isSelected && isInteractive}
					opacity={labelOpacity}
					eventHandlers={{
						click: (e) => {
							if (!isInteractive) return;
							L.DomEvent.stopPropagation(e);
							actions.selectItem('area', area._id);
						},
						dragend: handleLabelDrag, // Only update on drop to save performance
					}}
				/>
			)}

			{/* EDIT HANDLES */}
			{isSelected && (
				<>
					{area.points.map((pt, idx) => (
						<React.Fragment key={`v-${idx}`}>
							<Marker
								position={pt.coordinates}
								icon={handleIcon}
								draggable={true}
								eventHandlers={{
									dragend: (e) => {
										const { lat, lng } = e.target.getLatLng();
										actions.updateAreaPoint(area._id, idx, [lat, lng]);
									},
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
};

export default function EditAreasLayer() {
	const { state, actions } = useAtlasEditor();
	const { areas, selection, activeTool, visibility } = state;
	if (!visibility.areas) return null;
	return (
		<>
			<PatternDefs areas={areas} />
			{areas.map((area) => (
				<AreaItem key={area._id} area={area} selection={selection} activeTool={activeTool} actions={actions} />
			))}
		</>
	);
}
