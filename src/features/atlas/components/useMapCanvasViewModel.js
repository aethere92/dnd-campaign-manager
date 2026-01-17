import { useState, useEffect, useMemo } from 'react';

export function useMapCanvasViewModel(data) {
	// 1. Initialize Visibility
	const [visibility, setVisibility] = useState(() => {
		const init = { areas: false };
		if (!data) return init;

		// Initialize marker categories
		const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean);
		uniqueCats.forEach((cat) => {
			init[`marker-cat-${cat}`] = true;
		});

		// Initialize individual markers
		data.markers.forEach((m) => {
			if (m.label) init[`marker-item-${m.label}`] = true;
		});

		// Sessions/Overlays: OFF by default unless specified
		data.sessions.forEach((s) => (init[`session-${s.name}`] = true)); // Defaulting to TRUE for MiniMaps is usually better
		data.overlays.forEach((o) => (init[`overlay-${o.name}`] = true));

		return init;
	});

	// Sync with data updates
	useEffect(() => {
		if (!data) return;
		setVisibility((prev) => {
			const next = { ...prev };
			let changed = false;

			// Sync Categories
			const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean);
			uniqueCats.forEach((cat) => {
				const key = `marker-cat-${cat}`;
				if (next[key] === undefined) {
					next[key] = true;
					changed = true;
				}
			});

			// Sync Items
			data.markers.forEach((m) => {
				const key = `marker-item-${m.label}`;
				if (next[key] === undefined) {
					next[key] = true;
					changed = true;
				}
			});

			return changed ? next : prev;
		});
	}, [data?.markers]);

	const toggleLayer = (id) => {
		setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
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
					// CRITICAL FIX: Safe access to bounds[0]
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
