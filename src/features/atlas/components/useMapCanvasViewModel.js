import { useState, useEffect, useMemo } from 'react';
import { BookOpen, MapPin, Image as ImageIcon, Map as MapIcon } from 'lucide-react';

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

		// Initialize individual markers (new)
		data.markers.forEach((m) => {
			if (m.label) init[`marker-item-${m.label}`] = true;
		});

		// Sessions/Overlays: OFF by default
		data.sessions.forEach((s) => (init[`session-${s.name}`] = false));
		data.overlays.forEach((o) => (init[`overlay-${o.name}`] = false));

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

		// 1. Sessions
		if (data.sessions.length > 0) {
			groups.push({
				id: 'sessions-group',
				label: 'Sessions & Paths',
				items: data.sessions
					.map((s) => ({
						label: s.name,
						id: `session-${s.name}`,
						position: s.points[0]?.coordinates,
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
					id: `marker-item-${m.label}`, // Individual ID
					position: m.position,
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
					position: o.bounds[0],
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
					id: 'areas', // Shared ID for all areas for now
					position: a.positions[0],
				})),
			});
		}

		return groups;
	}, [data]);

	// 3. Filter Layers
	// Logic: Marker is visible if Category is ON AND Individual Item is ON
	const visibleMarkers = useMemo(
		() =>
			data?.markers.filter(
				(m) =>
					visibility[`marker-cat-${m.category}`] !== false && // Default to true if undefined
					visibility[`marker-item-${m.label}`] !== false
			) || [],
		[data, visibility]
	);

	const visibleSessions = useMemo(
		() => data?.sessions.filter((s) => visibility[`session-${s.name}`] || visibility['sessions-group']) || [],
		[data, visibility]
	);

	const visibleOverlays = useMemo(
		() => data?.overlays.filter((o) => visibility[`overlay-${o.name}`] || visibility['overlays-group']) || [],
		[data, visibility]
	);

	return {
		visibility,
		toggleLayer,
		sidebarGroups,
		visibleMarkers,
		visibleSessions,
		visibleOverlays,
		showAreas: visibility['areas'],
	};
}
