import React, { useState } from 'react';
import { Polygon, Marker } from 'react-leaflet';
import { createLabelIcon } from '@/features/atlas/utils/markerUtils';
import { getRoundedPath } from '@/features/atlas/utils/pathUtils';
import { PatternDefs } from '@/features/admin/components/atlas/components/PatternDefs';

const getCentroid = (points) => {
	if (!points || points.length === 0) return [0, 0];
	let lat = 0,
		lng = 0;
	points.forEach((p) => {
		lat += Array.isArray(p) ? p[0] : p.coordinates[0];
		lng += Array.isArray(p) ? p[1] : p.coordinates[1];
	});
	return [lat / points.length, lng / points.length];
};

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

	if (area.fillType === 'hatch' || area.fillType === 'dots') {
		const cleanColor = (area.interiorColor || '#d97706').replace('#', '');
		const safeOpacity = Math.round(fillOpacity * 100);
		fillColor = `url(#pattern-${area.fillType}-${cleanColor}-${safeOpacity})`;
		fillOpacity = 1;
	}

	// Label Visibility Logic
	let labelOpacity = 0;
	if (area.labelDisplay === 'always') labelOpacity = 1;
	else if (area.labelDisplay === 'hover' && isHovered) labelOpacity = 1;

	return (
		<React.Fragment>
			<Polygon
				positions={positions}
				pathOptions={{
					color: area.borderStyle === 'none' ? 'transparent' : area.lineColor || '#transparent',
					fillColor: fillColor,
					fillOpacity: fillOpacity,
					weight: area.weight || 1, // Default viewer weight to 1 if not set
					dashArray: area.borderStyle === 'dashed' ? '10, 10' : area.borderStyle === 'dotted' ? '2, 6' : null,
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
			<PatternDefs areas={areas} />
			{areas.map((area, idx) => (
				<MapAreaItem key={`${area.name}-${idx}`} area={area} />
			))}
		</>
	);
};
