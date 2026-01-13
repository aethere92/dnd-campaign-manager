/**
 * Calculates a smooth path using Cardinal Splines.
 * @param {Array} points - Array of [lat, lng] arrays
 * @param {number} tension - 0.0 (loose) to 1.0 (tight/straight)
 * @param {number} numOfSegments - Resolution
 * @param {boolean} closed - If true, connects end to start smoothly
 */
export const getSmoothPath = (points, tension = 0.5, numOfSegments = 10, closed = false) => {
	if (!points || points.length < 3) return points;

	const res = [];

	// Convert normalized 0-1 "curviness" to Cardinal Spline tension
	// Input 0 (Straight) -> Tension 1.0
	// Input 1 (Curved) -> Tension 0.0 (Standard Catmull-Rom is 0.5, but we want looser for maps)
	const t = 1.0 - Math.max(0, Math.min(1, tension));

	const pts = closed ? [...points, points[0], points[1]] : [...points];
	// Add guard points for open paths
	if (!closed) {
		pts.unshift(points[0]);
		pts.push(points[points.length - 1]);
	} else {
		pts.unshift(points[points.length - 2]);
	}

	for (let i = 1; i < pts.length - 2; i++) {
		const p0 = pts[i - 1];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2];

		for (let j = 0; j < numOfSegments; j++) {
			// Don't add the last point of the segment to avoid duplicates with the next segment's start
			// unless it's the very last segment of the path
			if (j === 0 && i > 1) continue;

			const st = j / numOfSegments;

			// Cardinal Spline Basis Function
			const t2 = st * st;
			const t3 = t2 * st;

			// s = (1 - tension) / 2
			const s = (1 - t) / 2;

			const calc = (v0, v1, v2, v3) => {
				return (
					(-s * t3 + 2 * s * t2 - s * st) * v0 +
					((2 - s) * t3 + (s - 3) * t2 + 1) * v1 +
					((s - 2) * t3 + (3 - 2 * s) * t2 + s * st) * v2 +
					(s * t3 - s * t2) * v3
				);
			};

			const x = calc(p0[0], p1[0], p2[0], p3[0]);
			const y = calc(p0[1], p1[1], p2[1], p3[1]);

			res.push([x, y]);
		}
	}

	// Ensure the final point is exact
	if (!closed) res.push(points[points.length - 1]);

	return res;
};

/**
 * Rounds the corners of a polygon using Quadratic Bezier curves.
 * @param {Array} points - Array of [lat, lng]
 * @param {number} radius - 0 to 1 (mapped to a smoothing factor)
 * @param {boolean} closed - Whether the path is a closed loop
 */
export const getRoundedPath = (points, radius = 0, closed = false) => {
	if (!points || points.length < 3 || radius <= 0) return points;

	const distFactor = Math.min(0.5, radius * 0.5);

	const res = [];
	const len = points.length;
	const loopCount = closed ? len : len - 1;

	for (let i = 0; i < loopCount; i++) {
		const curr = points[i];
		const prev = points[(i - 1 + len) % len];
		const next = points[(i + 1) % len];

		if (!closed && (i === 0 || i === len - 1)) {
			res.push(curr);
			continue;
		}

		const pStart = [curr[0] + (prev[0] - curr[0]) * distFactor, curr[1] + (prev[1] - curr[1]) * distFactor];

		const pEnd = [curr[0] + (next[0] - curr[0]) * distFactor, curr[1] + (next[1] - curr[1]) * distFactor];

		const segments = 5;
		for (let j = 0; j <= segments; j++) {
			const t = j / segments;
			const invT = 1 - t;
			const lat = invT * invT * pStart[0] + 2 * invT * t * curr[0] + t * t * pEnd[0];
			const lng = invT * invT * pStart[1] + 2 * invT * t * curr[1] + t * t * pEnd[1];
			if (res.length === 0 || res[res.length - 1][0] !== lat || res[res.length - 1][1] !== lng) {
				res.push([lat, lng]);
			}
		}
	}

	if (!closed) {
		res.unshift(points[0]);
		res.push(points[len - 1]);
	}

	return res;
};
