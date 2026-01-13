/**
 * Transforms raw Supabase/JSON data into flat Editor State
 * Assigns temporary _id for session management if missing
 */
export const normalizeMapData = (dbData) => {
	// 1. Markers (Flatten from Categories)
	const markers = [];
	const rawAnn = dbData.annotations || {};

	Object.entries(rawAnn).forEach(([catKey, catData]) => {
		if (Array.isArray(catData.items)) {
			catData.items.forEach((item) => {
				markers.push({
					...item,
					category: catKey,
					_id: item._id || crypto.randomUUID(), // Stable ID for session
					lat: Number(item.lat) || 0,
					lng: Number(item.lng) || 0,
				});
			});
		}
	});

	// 2. Paths
	const paths = (dbData.paths || []).map((p) => ({
		...p,
		_id: p._id || crypto.randomUUID(),
		points: (Array.isArray(p.points) ? p.points : []).map((pt) => {
			// Normalize point structure: [lat,lng] -> { coordinates: [lat,lng], text: "" }
			if (Array.isArray(pt)) return { coordinates: pt, text: '' };
			return pt;
		}),
	}));

	// 3. Areas (Regions)
	const areas = [];
	const rawAreas = dbData.areas || {};
	// Handle both legacy array format and object format
	const areaList = Array.isArray(rawAreas) ? rawAreas : Object.values(rawAreas).flatMap((cat) => cat.items || []);

	areaList.forEach((a) => {
		areas.push({
			...a,
			_id: a._id || crypto.randomUUID(),
			points: Array.isArray(a.points) ? a.points : [],
		});
	});

	// 4. Overlays
	const overlays = (dbData.overlays || []).map((o) => ({
		...o,
		_id: o._id || crypto.randomUUID(),
		// Ensure bounds are valid arrays
		bounds: o.bounds || [
			[0, 0],
			[0, 0],
		],
	}));

	return { markers, paths, areas, overlays };
};

/**
 * Prepares Editor State for Database Save
 * Removes temporary IDs and re-nests data
 */
export const serializeMapData = (state) => {
	// 1. Re-nest Markers
	const annotations = {};
	state.markers.forEach((m) => {
		const cat = m.category || 'default';
		// Auto-generate nice name if new category
		if (!annotations[cat]) {
			const name = cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
			annotations[cat] = { name, items: [] };
		}

		const { _id, category, ...cleanItem } = m;
		// Enforce precision
		cleanItem.lat = Number(cleanItem.lat.toFixed(4));
		cleanItem.lng = Number(cleanItem.lng.toFixed(4));

		annotations[cat].items.push(cleanItem);
	});

	// 2. Clean Paths
	const paths = state.paths.map(({ _id, ...p }) => ({
		...p,
		points: p.points.map((pt) => ({
			...pt,
			coordinates: [Number(pt.coordinates[0].toFixed(4)), Number(pt.coordinates[1].toFixed(4))],
		})),
	}));

	// 3. Clean Areas
	const areas = {
		regions: {
			name: 'Regions',
			items: state.areas.map(({ _id, ...a }) => ({
				...a,
				points: a.points.map((pt) => ({
					...pt,
					coordinates: [Number(pt.coordinates[0].toFixed(4)), Number(pt.coordinates[1].toFixed(4))],
				})),
			})),
		},
	};

	// 4. Clean Overlays
	const overlays = state.overlays.map(({ _id, ...o }) => o);

	return { annotations, paths, areas, overlays };
};
