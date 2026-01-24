import React, { useMemo, useRef, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';

// Conservative Ramer-Douglas-Peucker simplification
// Only removes points that are truly redundant (nearly collinear)
const simplifyPath = (points, tolerance = 0.5) => {
	if (points.length <= 2) return points;

	const getSqSegDist = (p, p1, p2) => {
		let x = p1[0],
			y = p1[1];
		let dx = p2[0] - x,
			dy = p2[1] - y;

		if (dx !== 0 || dy !== 0) {
			const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
			if (t > 1) {
				x = p2[0];
				y = p2[1];
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p[0] - x;
		dy = p[1] - y;
		return dx * dx + dy * dy;
	};

	const simplifyDPStep = (points, first, last, sqTolerance, simplified) => {
		let maxSqDist = sqTolerance;
		let index = 0;

		for (let i = first + 1; i < last; i++) {
			const sqDist = getSqSegDist(points[i], points[first], points[last]);
			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
			simplified.push(points[index]);
			if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
		}
	};

	const last = points.length - 1;
	const simplified = [points[0]];
	simplifyDPStep(points, 0, last, tolerance * tolerance, simplified);
	simplified.push(points[last]);

	return simplified;
};

// Only update on significant zoom changes (prevents re-render on every frame)
const useZoomLevel = () => {
	const map = useMap();
	const [zoom, setZoom] = React.useState(() => Math.floor(map.getZoom()));

	useEffect(() => {
		const handleZoomEnd = () => {
			const currentZoom = Math.floor(map.getZoom());
			setZoom((prevZoom) => {
				// Only update if zoom level changed significantly (full integer)
				if (Math.abs(currentZoom - prevZoom) >= 1) {
					return currentZoom;
				}
				return prevZoom;
			});
		};

		// ONLY listen to zoomend, not zoom events during animation
		map.on('zoomend', handleZoomEnd);
		return () => {
			map.off('zoomend', handleZoomEnd);
		};
	}, [map]);

	return zoom;
};

export const MapFogLayer = ({ fogConfig, bounds }) => {
	if (!fogConfig || !fogConfig.enabled || !bounds) return null;

	const zoom = useZoomLevel();
	const height = Math.abs(bounds[0][0] - bounds[1][0]);
	const width = Math.abs(bounds[1][1] - bounds[0][1]);

	const processedData = useMemo(() => {
		// MUCH more conservative tolerance
		// Only simplify at very low zoom levels, and minimally
		const baseTolerance = width / 2000; // Very conservative base
		const zoomFactor = Math.max(0, 10 - zoom); // Only simplify at zoom < 10
		const tolerance = baseTolerance * Math.pow(1.5, zoomFactor);

		const blurAmount = fogConfig.edgeSoftness || 0;

		const paths = fogConfig.shapes.map((shape) => {
			if (!shape.points || shape.points.length === 0) return { path: '', pointCount: 0 };

			// Only simplify if we have excessive points AND are zoomed out
			const shouldSimplify = shape.points.length > 200 && zoom < 12;
			const processedPoints = shouldSimplify ? simplifyPath(shape.points, tolerance) : shape.points;

			// Convert to SVG path
			const d = processedPoints.map((p) => `${p[1]} ${-p[0]}`).join(' L ');

			return {
				path: `M ${d} Z`,
				pointCount: processedPoints.length,
				original: shape.points.length,
			};
		});

		const totalPoints = paths.reduce((sum, p) => sum + p.pointCount, 0);

		return {
			paths: paths.map((p) => p.path),
			stats: {
				totalPoints,
				shapeCount: paths.length,
				zoom,
			},
			renderStrategy: {
				// More intelligent blur strategy
				useCSS: blurAmount > 0 && blurAmount < 10 && totalPoints < 800,
				skipBlur: blurAmount < 0.3,
				// Only promote complex scenes
				useLayerPromotion: totalPoints > 2000 || (paths.length > 30 && blurAmount > 5),
			},
		};
	}, [fogConfig.shapes, fogConfig.edgeSoftness, zoom, width]);

	const isCloudMode = fogConfig.invert;
	const blurStdDev = fogConfig.edgeSoftness || 0;
	const fogColor = fogConfig.color || '#1a1d21';
	const fogOpacity = fogConfig.opacity || 0.9;

	const { paths, renderStrategy } = processedData;
	const filterId = useRef(`fog-blur-${Math.random().toString(36).substr(2, 9)}`).current;

	// Blur strategy
	let blurStyle = {};
	let svgFilter = null;

	if (!renderStrategy.skipBlur) {
		if (renderStrategy.useCSS) {
			blurStyle = { filter: `blur(${blurStdDev * 0.25}px)` };
		} else {
			svgFilter = `url(#${filterId})`;
		}
	}

	const baseStyle = {
		pointerEvents: 'none',
		// Force GPU rendering to be stable during transforms
		transform: 'translate3d(0,0,0)',
		...(renderStrategy.useLayerPromotion && {
			willChange: 'transform',
		}),
	};

	return (
		<SVGOverlay
			attributes={{
				viewBox: `0 0 ${width} ${height}`,
				shapeRendering: 'geometricPrecision', // Better for organic shapes
			}}
			bounds={bounds}
			opacity={1}
			zIndex={500}
			// CRITICAL: Prevent interaction events during zoom
			interactive={false}>
			<defs>
				{!renderStrategy.skipBlur && !renderStrategy.useCSS && (
					<filter id={filterId} filterUnits='userSpaceOnUse' colorInterpolationFilters='sRGB'>
						<feGaussianBlur stdDeviation={blurStdDev} in='SourceGraphic' />
					</filter>
				)}

				<mask id='fog-mask'>
					<rect x='0' y='0' width='100%' height='100%' fill='white' />
					{paths.map((d, i) => (
						<path key={i} d={d} fill='black' filter={svgFilter} style={blurStyle} />
					))}
				</mask>
			</defs>

			{!isCloudMode ? (
				<rect
					x='0'
					y='0'
					width='100%'
					height='100%'
					fill={fogColor}
					fillOpacity={fogOpacity}
					mask='url(#fog-mask)'
					style={baseStyle}
				/>
			) : (
				<g style={baseStyle}>
					{paths.map((d, i) => (
						<path key={i} d={d} fill={fogColor} fillOpacity={fogOpacity} filter={svgFilter} style={blurStyle} />
					))}
				</g>
			)}
		</SVGOverlay>
	);
};
