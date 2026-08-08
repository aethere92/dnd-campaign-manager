import { useCallback, useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

export const MapZoomHandler = ({ referenceZoom = 3 }) => {
	const map = useMap();

	// useCallback so the effect below can list it as a dependency. It also means a
	// changed `referenceZoom` now recomputes the label scale — previously the effect
	// depended on [map] alone, so the prop was ignored until the next zoom event.
	const updateScale = useCallback(() => {
		const zoom = map.getZoom();

		// 1. Calculate Geographic Scale (Standard map math: 2^diff)
		const geoScale = Math.pow(2, zoom - referenceZoom);

		// 2. Apply Clamping Strategy
		// - Shrink when zooming out (zoom < ref) to prevent overlap.
		// - Stop growing when zooming in (zoom > ref) to keep text readable/non-obstructive.
		// - Min limit 0.1 to prevent total disappearance.
		const scale = Math.min(1, Math.max(0.1, geoScale));

		map.getContainer().style.setProperty('--label-scale', scale);

		// Inverse scale (if we ever need elements to grow while map shrinks)
		map.getContainer().style.setProperty('--inv-label-scale', 1 / scale);
	}, [map, referenceZoom]);

	useMapEvents({
		zoom: updateScale,
		zoomend: updateScale,
	});

	useEffect(() => {
		updateScale();
	}, [updateScale]);

	return null;
};
