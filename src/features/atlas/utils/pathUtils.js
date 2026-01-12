// Lightweight Catmull-Rom Spline implementation for smoothing paths
export const getSmoothPath = (points, tension = 0.5, numSegments = 16) => {
	if (!points || points.length < 2) return points;
	if (tension === 0) return points; // Straight line

	const res = [];

	// Helper to format point for math
	const _pts = points.map((p) => ({
		x: Array.isArray(p) ? p[0] : p.lat,
		y: Array.isArray(p) ? p[1] : p.lng,
	}));

	// Add explicit start/end control points by duplicating ends
	const pts = [_pts[0], ..._pts, _pts[_pts.length - 1]];

	for (let i = 0; i < pts.length - 3; i++) {
		const p0 = pts[i];
		const p1 = pts[i + 1];
		const p2 = pts[i + 2];
		const p3 = pts[i + 3];

		for (let t = 0; t <= numSegments; t++) {
			const t1 = t / numSegments;
			const t2 = t1 * t1;
			const t3 = t2 * t1;

			// Catmull-Rom calculation
			const x =
				0.5 *
				(2 * p1.x +
					(-p0.x + p2.x) * t1 +
					(2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
					(-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

			const y =
				0.5 *
				(2 * p1.y +
					(-p0.y + p2.y) * t1 +
					(2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
					(-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

			// Don't add duplicate points
			if (res.length === 0 || (res[res.length - 1][0] !== x && res[res.length - 1][1] !== y)) {
				res.push([x, y]);
			}
		}
	}

	// Ensure the very last point is exact
	const last = points[points.length - 1];
	res.push(Array.isArray(last) ? last : [last.lat, last.lng]);

	return res;
};

// Preset Configs
export const PATH_STYLES = {
	patterns: {
		solid: '',
		dashed: '12, 12',
		dotted: '1, 8',
	},
	widths: {
		thin: 2,
		medium: 5,
		thick: 8,
		extra: 12,
	},
	curviness: {
		none: 0,
		low: 0.3,
		high: 0.8,
	},
};
