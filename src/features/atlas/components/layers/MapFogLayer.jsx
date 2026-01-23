import React, { useMemo } from 'react';
import { SVGOverlay } from 'react-leaflet';

export const MapFogLayer = ({ fogConfig, bounds }) => {
	if (!fogConfig || !fogConfig.enabled || !bounds) return null;

	// 1. Calculate Map Dimensions
	// In CRS.Simple, bounds are usually [[-Height, 0], [0, Width]]
	// We need absolute width/height for the SVG viewBox
	const height = Math.abs(bounds[0][0] - bounds[1][0]);
	const width = Math.abs(bounds[1][1] - bounds[0][1]);

	// 2. Generate SVG Path Data
	// Transformation: Map(lat, lng) -> SVG(x, y)
	// x = lng
	// y = -lat (Since lat is negative down, -lat is positive down)
	const shapePaths = useMemo(() => {
		return fogConfig.shapes.map((shape) => {
			if (!shape.points || shape.points.length === 0) return '';
			// Map [lat, lng] to "lng -lat"
			const d = shape.points.map((p) => `${p[1]} ${-p[0]}`).join(' L ');
			return `M ${d} Z`;
		});
	}, [fogConfig.shapes]);

	// 3. Configuration
	const isCloudMode = fogConfig.invert; // false = Reveal (Holes), true = Cloud (Patches)

	// Cloud Mode: Base is transparent, Shapes are fog color
	// Reveal Mode: Base is fog color, Shapes are "holes"

	// We use a Mask to achieve the "Reveal" effect with soft edges.
	// Mask White = Visible, Mask Black = Transparent

	const maskBaseFill = 'white';
	const maskShapeFill = 'black';

	// 4. Blur Calculation
	// We use a fixed percentage of map width to ensure blur stays relative to map features
	// (A 10-mile fog bank is always 10 miles wide, regardless of zoom level)
	// Alternatively, use the config value as "Map Units".
	const blurStdDev = fogConfig.edgeSoftness || 0;

	return (
		<SVGOverlay attributes={{ viewBox: `0 0 ${width} ${height}` }} bounds={bounds} opacity={1} zIndex={500}>
			<defs>
				{/* 
                    filterUnits="userSpaceOnUse" ensures the blur value is treated as MAP COORDINATES 
                    (e.g. 20 = 20 pixels of the original image), not screen pixels. 
                    This stops the "opacity changing on zoom" issue.
                */}
				<filter id='fog-blur' filterUnits='userSpaceOnUse'>
					<feGaussianBlur stdDeviation={blurStdDev} />
				</filter>

				<mask id='fog-mask'>
					{/* The Base Canvas (The Shroud) */}
					<rect x='0' y='0' width='100%' height='100%' fill={maskBaseFill} />

					{/* The Cutouts (The Revealed Areas) */}
					{shapePaths.map((d, i) => (
						<path key={i} d={d} fill={maskShapeFill} filter='url(#fog-blur)' />
					))}
				</mask>
			</defs>

			{/* RENDER LOGIC */}
			{!isCloudMode ? (
				// REVEAL MODE (Standard Fog of War)
				// We render a giant rect covered by the mask
				<rect
					x='0'
					y='0'
					width='100%'
					height='100%'
					fill={fogConfig.color || '#1a1d21'}
					fillOpacity={fogConfig.opacity || 0.9}
					mask='url(#fog-mask)'
					style={{ pointerEvents: 'none' }}
				/>
			) : (
				// CLOUD MODE (Adding Fog Patches)
				// We render just the shapes directly
				<g style={{ pointerEvents: 'none' }}>
					{shapePaths.map((d, i) => (
						<path
							key={i}
							d={d}
							fill={fogConfig.color || '#1a1d21'}
							fillOpacity={fogConfig.opacity || 0.9}
							filter='url(#fog-blur)'
						/>
					))}
				</g>
			)}
		</SVGOverlay>
	);
};
