import React from 'react';
import { Polygon, Marker } from 'react-leaflet';
import { createLabelIcon } from '@/features/atlas/utils/markerUtils';

// Helper to calculate centroid if no manual position exists
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

export const MapAreas = ({ areas }) => {
	if (!areas || areas.length === 0) return null;

	return (
		<>
			{areas.map((area, idx) => {
				// Handle data structure variance (DB vs File)
				const positions = area.positions || (area.points || []).map((p) => p.coordinates);
				if (!positions || positions.length === 0) return null;

				const center = area.labelPosition || getCentroid(positions);

				return (
					<React.Fragment key={`${area.name}-${idx}`}>
						<Polygon
							positions={positions}
							pathOptions={{
								color: area.lineColor || 'transparent',
								fillColor: area.interiorColor || '#ff0000',
								fillOpacity: 0.3,
								weight: 1,
							}}
						/>
						{/* Text Label Marker */}
						{area.name && (
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
								interactive={false} // Pass events through to polygon/map
							/>
						)}
					</React.Fragment>
				);
			})}
		</>
	);
};
