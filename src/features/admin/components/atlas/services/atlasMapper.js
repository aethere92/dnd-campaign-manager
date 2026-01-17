/* --- FILE: features/admin/components/atlas/services/atlasMapper.js --- */

// Helper: Native UUID generation
const generateId = () => {
	if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
		return self.crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const normalizeMapData = (dbData) => {
	const data = dbData || {};

	// 1. Markers
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
				});
			});
		}
	});

	// 2. Paths
	const paths = (data.paths || []).map((p) => ({
		...p,
		_id: p._id || p.id || generateId(),
		textAlongLine: !!p.textAlongLine,
		// FIX: Default to 'hover' if missing, so text isn't invisible by default
		labelDisplay: p.labelDisplay || 'hover',
		labelStyle: p.labelStyle || 'box',
		points: (Array.isArray(p.points) ? p.points : []).map((pt) => {
			if (Array.isArray(pt)) return { coordinates: pt, text: '' };
			return pt;
		}),
	}));

	// 3. Areas
	const areas = [];
	const rawAreas = data.areas || {};
	const areaList = Array.isArray(rawAreas) ? rawAreas : Object.values(rawAreas).flatMap((cat) => cat.items || []);

	areaList.forEach((a) => {
		areas.push({
			...a,
			_id: a._id || a.id || generateId(),
			points: Array.isArray(a.points) ? a.points : [],
		});
	});

	// 4. Overlays
	const overlays = (data.overlays || []).map((o) => {
		let safeBounds = o.bounds;
		if (!safeBounds || !Array.isArray(safeBounds) || safeBounds.length < 2) {
			safeBounds = [
				[0, 0],
				[0, 0],
			];
		}
		return {
			...o,
			_id: o._id || o.id || generateId(),
			bounds: safeBounds,
		};
	});

	return { markers, paths, areas, overlays };
};

export const serializeMapData = (state) => {
	const annotations = {};
	state.markers.forEach((m) => {
		const cat = m.category || 'default';
		if (!annotations[cat]) {
			const name = cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
			annotations[cat] = { name, items: [] };
		}
		const { _id, id, position, category, ...cleanItem } = m;
		cleanItem.lat = Number(Number(cleanItem.lat).toFixed(4));
		cleanItem.lng = Number(Number(cleanItem.lng).toFixed(4));
		cleanItem.id = _id || id;
		annotations[cat].items.push(cleanItem);
	});

	const paths = state.paths.map(({ _id, id, ...p }) => ({
		...p,
		id: _id || id,
		points: p.points.map((pt) => ({
			...pt,
			coordinates: [Number(pt.coordinates[0].toFixed(4)), Number(pt.coordinates[1].toFixed(4))],
		})),
	}));

	const areas = {
		regions: {
			name: 'Regions',
			items: state.areas.map(({ _id, id, ...a }) => ({
				...a,
				id: _id || id,
				points: a.points.map((pt) => ({
					...pt,
					coordinates: [Number(pt.coordinates[0].toFixed(4)), Number(pt.coordinates[1].toFixed(4))],
				})),
			})),
		},
	};

	const overlays = state.overlays.map(({ _id, id, ...o }) => ({
		...o,
		id: _id || id,
	}));

	return { annotations, paths, areas, overlays };
};
