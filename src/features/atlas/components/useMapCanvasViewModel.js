import { useState, useEffect, useMemo } from 'react';
import { BookOpen, MapPin, Image as ImageIcon, Map as MapIcon } from 'lucide-react';

export function useMapCanvasViewModel(data) {
	// 1. Initialize Visibility
	const [visibility, setVisibility] = useState(() => {
		const init = { areas: false };
		if (!data) return init;

		// Initialize marker categories to TRUE
		const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean);
		uniqueCats.forEach((cat) => {
			init[`marker-${cat}`] = true;
		});

		// Sessions/Overlays: OFF by default
		data.sessions.forEach((s) => (init[`session-${s.name}`] = false));
		data.overlays.forEach((o) => (init[`overlay-${o.name}`] = false));

		return init;
	});

	// Sync with data updates
	useEffect(() => {
		if (!data) return;
		const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean);
		setVisibility((prev) => {
			const next = { ...prev };
			let changed = false;
			uniqueCats.forEach((cat) => {
				const key = `marker-${cat}`;
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
	const controlGroups = useMemo(() => {
		if (!data) return {};
		const uniqueCats = [...new Set(data.markers.map((m) => m.category))].filter(Boolean).sort();

		return {
			overlays: data.overlays.map((o) => ({ id: `overlay-${o.name}`, label: o.name })),
			sessions: data.sessions.map((s) => ({ id: `session-${s.name}`, label: s.name })),
			markers: uniqueCats.map((c) => ({ id: `marker-${c}`, label: c })),
			icons: {
				overlays: ImageIcon,
				sessions: BookOpen,
				markers: MapPin,
				areas: MapIcon,
			},
		};
	}, [data]);

	// 3. Filter Layers
	const visibleMarkers = useMemo(
		() => data?.markers.filter((m) => visibility[`marker-${m.category}`]) || [],
		[data, visibility]
	);
	const visibleSessions = useMemo(
		() => data?.sessions.filter((s) => visibility[`session-${s.name}`]) || [],
		[data, visibility]
	);
	const visibleOverlays = useMemo(
		() => data?.overlays.filter((o) => visibility[`overlay-${o.name}`]) || [],
		[data, visibility]
	);

	return {
		visibility,
		toggleLayer,
		controlGroups,
		visibleMarkers,
		visibleSessions,
		visibleOverlays,
		showAreas: visibility['areas'],
	};
}
