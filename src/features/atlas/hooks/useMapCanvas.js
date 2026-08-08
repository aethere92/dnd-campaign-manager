import { useState, useMemo } from 'react';

export function useMapCanvas(data) {
	// 1. Visibility = per-layer defaults derived from `data`, with the user's
	// explicit toggles layered on top.
	//
	// This used to be a single state object seeded from `data`, plus an effect that
	// back-filled keys for layers that appeared later. Deriving the defaults
	// instead means newly-arrived markers are visible immediately — no post-render
	// state update, so no cascading render (react-hooks/set-state-in-effect) and no
	// frame where a new marker is missing from the sidebar's checked count.
	const [overrides, setOverrides] = useState({});

	// Areas start hidden; every other layer present in `data` starts visible.
	const defaults = useMemo(() => {
		const init = { areas: false };
		if (!data) return init;

		const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean);
		uniqueCats.forEach((cat) => {
			init[`marker-cat-${cat}`] = true;
		});

		data.markers.forEach((m) => {
			if (m.label) init[`marker-item-${m.label}`] = true;
		});

		data.sessions.forEach((s) => (init[`session-${s.name}`] = true));
		data.overlays.forEach((o) => (init[`overlay-${o.name}`] = true));

		return init;
	}, [data]);

	const visibility = useMemo(() => ({ ...defaults, ...overrides }), [defaults, overrides]);

	// Resolves the current value from `prev` rather than the rendered `visibility`
	// object, so two toggles dispatched in the same batch don't both read the same
	// pre-batch value.
	const toggleLayer = (id) => {
		setOverrides((prev) => ({
			...prev,
			[id]: !(id in prev ? prev[id] : defaults[id]),
		}));
	};

	// 2. Control Groups Configuration
	const sidebarGroups = useMemo(() => {
		if (!data) return [];

		const groups = [];

		// 1. Sessions (Paths)
		if (data.sessions.length > 0) {
			groups.push({
				id: 'sessions-group',
				label: 'Sessions & Paths',
				items: data.sessions
					.map((s) => ({
						label: s.name,
						id: `session-${s.name}`,
						// Safe access to coordinates
						position: s.points && s.points[0] ? s.points[0].coordinates : [0, 0],
					}))
					.filter((i) => i.position),
			});
		}

		// 2. Markers by Category
		const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean).sort();

		uniqueCats.forEach((cat) => {
			const catId = `marker-cat-${cat}`;
			const catMarkers = data.markers.filter((m) => m.category === cat);

			groups.push({
				id: catId,
				label: cat,
				items: catMarkers.map((m) => ({
					label: m.label,
					id: `marker-item-${m.label}`,
					position: m.position || [0, 0],
				})),
			});
		});

		// 3. Overlays
		if (data.overlays.length > 0) {
			groups.push({
				id: 'overlays-group',
				label: 'Overlays',
				items: data.overlays.map((o) => ({
					label: o.name,
					id: `overlay-${o.name}`,
					position: o.bounds && o.bounds.length > 0 ? o.bounds[0] : [0, 0],
				})),
			});
		}

		// 4. Areas
		if (data.areas.length > 0) {
			groups.push({
				id: 'areas',
				label: 'Regions & Areas',
				items: data.areas.map((a) => ({
					label: a.name,
					id: 'areas',
					// Safe access to positions
					position:
						a.positions && a.positions[0] ? a.positions[0] : a.points && a.points[0] ? a.points[0].coordinates : [0, 0],
				})),
			});
		}

		return groups;
	}, [data]);

	// 3. Filter Layers
	const visibleMarkers = useMemo(
		() =>
			data?.markers.filter(
				(m) => visibility[`marker-cat-${m.category}`] !== false && visibility[`marker-item-${m.label}`] !== false
			) || [],
		[data, visibility]
	);

	const visibleSessions = useMemo(
		() => data?.sessions.filter((s) => visibility[`session-${s.name}`] !== false) || [],
		[data, visibility]
	);

	const visibleOverlays = useMemo(
		() => data?.overlays.filter((o) => visibility[`overlay-${o.name}`] !== false) || [],
		[data, visibility]
	);

	return {
		visibility,
		toggleLayer,
		sidebarGroups,
		visibleMarkers,
		visibleSessions,
		visibleOverlays,
		showAreas: visibility['areas'] !== false, // Default to true if undefined
	};
}
