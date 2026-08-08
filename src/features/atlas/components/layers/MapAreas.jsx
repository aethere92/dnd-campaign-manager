import React, { useState } from 'react';
import { Polygon, Marker } from 'react-leaflet';
import { createLabelIcon } from '@/features/atlas/utils/markerUtils';
import { getRoundedPath, getCentroid } from '@/features/atlas/utils/pathUtils';
import { PatternDefs } from '@/features/atlas/components/layers/PatternDefs';
import { getAreaPatternId, isPatternFill } from '@/features/atlas/utils/areaPattern';

const MapAreaItem = ({ area }) => {
	const [isHovered, setIsHovered] = useState(false);

	const rawPositions = area.positions || (area.points || []).map((p) => p.coordinates);
	if (!rawPositions || rawPositions.length === 0) return null;

	// Geometry Rounding
	const positions = area.curviness > 0 ? getRoundedPath(rawPositions, area.curviness, true) : rawPositions;

	const center = area.labelPosition || getCentroid(rawPositions);

	// Pattern Logic
	let fillColor = area.interiorColor || '#ff0000';
	let fillOpacity = area.fillOpacity ?? 0.3;

	// The pattern id must match the one PatternDefs registers, so both derive it
	// from getAreaPatternId — see the note there. (This used to inline the id with a
	// different opacity default, so unfilled-opacity hatch/dot areas referenced a
	// pattern that was never registered and rendered with no fill.)
	if (isPatternFill(area)) {
		fillColor = `url(#${getAreaPatternId(area).id})`;
		fillOpacity = 1;
	}

	// Label Visibility Logic
	// Default to 'always' when undefined; otherwise labels render invisible.
	const displayMode = area.labelDisplay || 'always';
	let labelOpacity = 0;
	if (displayMode === 'always') labelOpacity = 1;
	else if (displayMode === 'hover' && isHovered) labelOpacity = 1;

	return (
		<React.Fragment>
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
					mouseover: () => setIsHovered(true),
					mouseout: () => setIsHovered(false),
				}}
			/>
			{/* Text Label Marker */}
			{area.name && labelOpacity > 0 && (
				<Marker
					position={center}
					icon={createLabelIcon(area.name, {
						color: area.labelColor || '#ffffff',
						fontSize: area.fontSize || 16,
						rotation: area.textRotation || 0,
						bgColor: area.labelBgColor || 'transparent',
						bgOpacity: area.labelBgOpacity || 0,
						hasBorder: area.labelHasBorder,
						borderRadius: area.labelRadius,
						borderColor: area.labelBorderColor,
						paddingX: area.paddingX,
						paddingY: area.paddingY,
						isSelected: false,
					})}
					opacity={labelOpacity}
					interactive={false}
				/>
			)}
		</React.Fragment>
	);
};

export const MapAreas = ({ areas }) => {
	if (!areas || areas.length === 0) return null;

	return (
		<>
			{/* PatternDefs handles generating the SVG <defs> */}
			<PatternDefs areas={areas} />
			{areas.map((area, idx) => (
				<MapAreaItem key={`${area.name}-${idx}`} area={area} />
			))}
		</>
	);
};
