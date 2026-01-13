/**
 * Standardize coordinates to 4 decimal places
 */
export const roundCoord = (val) => Number(Number(val).toFixed(4));

export const getMidpoint = (p1, p2) => {
	// p1, p2 can be arrays [lat, lng] or objects with coordinates
	const c1 = Array.isArray(p1) ? p1 : p1.coordinates;
	const c2 = Array.isArray(p2) ? p2 : p2.coordinates;
	return [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
};

/**
 * Calculates new bounds for an overlay when a handle is dragged
 * @param {string} handle - 'tl', 'tr', 'bl', 'br'
 * @param {number} newLat
 * @param {number} newLng
 * @param {Array} oldBounds - [[lat1, lng1], [lat2, lng2]]
 */
export const calculateNewOverlayBounds = (handle, newLat, newLng, oldBounds) => {
	const [p1, p2] = oldBounds; // p1 is usually TL (or SW), p2 is BR (or NE)

	// Create copy
	let next = [[...p1], [...p2]];

	switch (handle) {
		case 'tl':
			next[0] = [newLat, newLng];
			break;
		case 'br':
			next[1] = [newLat, newLng];
			break;
		case 'tr':
			// Top Right: affects Lat of P1 (Top) and Lng of P2 (Right)
			next[0][0] = newLat;
			next[1][1] = newLng;
			break;
		case 'bl':
			// Bottom Left: affects Lat of P2 (Bottom) and Lng of P1 (Left)
			// Note: Leaflet bounds might be [SouthWest, NorthEast] or [TopLeft, BottomRight]
			// Depending on CRS.Simple, usually index 0 is TopLeft.
			// Assuming index 0 is Top-Left for simple maps:
			next[1][0] = newLat; // Bottom
			next[0][1] = newLng; // Left
			break;
	}

	return next;
};
