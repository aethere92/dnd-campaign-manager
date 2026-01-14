// --- FILE: layers/EditAreasLayer.jsx ---
import React, { useMemo, useState, useCallback } from 'react';
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

// Memoized Icon Creators to prevent recreation on every drag frame
const useAreaIcons = () => {
	return useMemo(
		() => ({
			handleIcon: createHandleIcon(true),
			midpointIcon: createMidpointIcon(),
		}),
		[]
	);
};

const AreaItem = React.memo(
	({ area, isSelected, isInteractive, actions }) => {
		const [isHovered, setIsHovered] = useState(false);
		const { handleIcon, midpointIcon } = useAreaIcons();

		const rawPoints = (area.points || []).map((p) => p.coordinates);

		// Geometry
		const positions = useMemo(() => {
			if (rawPoints.length < 3) return rawPoints;
			if (area.curviness > 0) return getRoundedPath(rawPoints, area.curviness, true);
			return rawPoints;
		}, [rawPoints, area.curviness]);

		// Center/Label Position
		const center = useMemo(() => {
			if (area.labelPosition) return area.labelPosition;
			if (!rawPoints || rawPoints.length === 0) return [0, 0];
			let lat = 0,
				lng = 0;
			area.points.forEach((p) => {
				lat += p.coordinates[0];
				lng += p.coordinates[1];
			});
			return [lat / area.points.length, lng / area.points.length];
		}, [area.labelPosition, area.points, rawPoints]); // Fixed dependency array

		// Pattern Logic
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

		// Label Logic
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

		// Event Handlers (Memoized)
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

		// Handle Label Drag
		const handleLabelDrag = useCallback(
			(e) => {
				const { lat, lng } = e.target.getLatLng();
				actions.updateArea(area._id, { labelPosition: [lat, lng] });
			},
			[area._id, actions]
		);

		if (positions.length === 0) return null;

		return (
			<React.Fragment>
				<Polygon
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

				{/* Label Marker */}
				{area.name && labelOpacity > 0 && (
					<Marker
						position={center}
						icon={labelIcon}
						draggable={isSelected && isInteractive}
						opacity={labelOpacity}
						eventHandlers={{
							click: onAreaClick,
							dragend: handleLabelDrag,
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
	},
	(prev, next) => {
		// Custom Comparison to prevent re-renders when other items change
		if (prev.area !== next.area) return false; // Data changed
		if (prev.isInteractive !== next.isInteractive) return false; // Tool mode changed
		if (prev.isSelected !== next.isSelected) return false; // Selection changed

		// If selected, check if deep selection (vertices) changed?
		// Note: We don't have deep selection indices for areas in the main selection object usually,
		// but if we did, we'd check it here.
		return true;
	}
);

export default function EditAreasLayer() {
	const { state, actions } = useAtlasEditor();
	const { areas, selection, activeTool, visibility } = state;

	if (!visibility.areas) return null;

	const isInteractive = activeTool === 'areas';

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
