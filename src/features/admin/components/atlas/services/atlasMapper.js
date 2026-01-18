const generateId = () => crypto.randomUUID();

export const normalizeMapData = (dbData) => {
	const data = dbData || {};

	// 1. EXTRACT CONFIG (Metadata)
	// We try to find it in the root or in a config property
	const mapConfig = data.metadata || data.config || {};

	// 2. MARKERS
	const markers = [];
	const rawAnn = data.annotations || {};
	Object.entries(rawAnn).forEach(([catKey, catData]) => {
		if (catData && Array.isArray(catData.items)) {
			catData.items.forEach((item) => {
				markers.push({
					...item,
					category: catKey,
					_id: item._id || item.id || generateId(),
					position: [Number(item.lat || 0), Number(item.lng || 0)],
					lat: Number(item.lat || 0),
					lng: Number(item.lng || 0),
					// NEW: Persist these fields
					visibleOnLoad: item.visibleOnLoad ?? true,
					targetLat: item.targetLat,
					targetLng: item.targetLng,
					targetZoom: item.targetZoom,
					mapLink: item.mapLink || '',
				});
			});
		}
	});

	// 3. PATHS
	const paths = (data.paths || []).map((p) => ({
		...p,
		_id: p._id || p.id || generateId(),
		textAlongLine: !!p.textAlongLine,
		labelDisplay: p.labelDisplay || 'hover',
		visibleOnLoad: p.visibleOnLoad ?? false, // Default Hidden
		points: (Array.isArray(p.points) ? p.points : []).map((pt) => {
			if (Array.isArray(pt)) return { coordinates: pt, text: '' };
			return pt;
		}),
	}));

	// 4. AREAS
	const areas = [];
	const rawAreas = data.areas || {};
	const areaList = Array.isArray(rawAreas) ? rawAreas : Object.values(rawAreas).flatMap((cat) => cat.items || []);
	areaList.forEach((a) => {
		areas.push({
			...a,
			_id: a._id || a.id || generateId(),
			visibleOnLoad: a.visibleOnLoad ?? false, // Default Hidden
			points: Array.isArray(a.points) ? a.points : [],
		});
	});

	// 5. OVERLAYS
	const overlays = (data.overlays || []).map((o) => ({
		...o,
		_id: o._id || o.id || generateId(),
		visibleOnLoad: o.visibleOnLoad ?? false, // Default Hidden
		bounds:
			Array.isArray(o.bounds) && o.bounds.length === 2
				? o.bounds
				: [
						[0, 0],
						[0, 0],
					],
	}));

	return { markers, paths, areas, overlays, mapConfig };
};

export const serializeMapData = (state) => {
	// 1. ANNOTATIONS
	const annotations = {};
	state.markers.forEach((m) => {
		const cat = m.category || 'default';
		if (!annotations[cat]) annotations[cat] = { name: cat, items: [] };

		const { _id, id, position, category, ...cleanItem } = m;
		annotations[cat].items.push({
			...cleanItem,
			id: _id || id,
			lat: Number(Number(m.lat).toFixed(4)),
			lng: Number(Number(m.lng).toFixed(4)),
			// Explicitly save props
			visibleOnLoad: m.visibleOnLoad,
			targetLat: m.targetLat,
			targetLng: m.targetLng,
			targetZoom: m.targetZoom,
			mapLink: m.mapLink,
		});
	});

	// 2. PATHS
	const paths = state.paths.map(({ _id, id, ...p }) => ({
		...p,
		id: _id || id,
		visibleOnLoad: !!p.visibleOnLoad,
		points: p.points.map((pt) => ({
			...pt,
			coordinates: [Number(pt.coordinates[0].toFixed(4)), Number(pt.coordinates[1].toFixed(4))],
		})),
	}));

	// 3. AREAS
	const areas = {
		regions: {
			name: 'Regions',
			items: state.areas.map(({ _id, id, ...a }) => ({
				...a,
				id: _id || id,
				visibleOnLoad: !!a.visibleOnLoad,
				points: a.points.map((pt) => ({
					...pt,
					coordinates: [Number(pt.coordinates[0].toFixed(4)), Number(pt.coordinates[1].toFixed(4))],
				})),
			})),
		},
	};

	// 4. OVERLAYS
	const overlays = state.overlays.map(({ _id, id, ...o }) => ({
		...o,
		id: _id || id,
		visibleOnLoad: !!o.visibleOnLoad,
	}));

	return { annotations, paths, areas, overlays };
};
