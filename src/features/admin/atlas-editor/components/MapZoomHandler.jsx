import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapZoomHandler = ({ referenceZoom = 2 }) => {
	const map = useMap();
	useEffect(() => {
		const updateSize = () => {
			const zoom = map.getZoom();
			const scale = Math.pow(2, referenceZoom - zoom);
			document.documentElement.style.setProperty('--map-scale', scale);
		};
		map.on('zoom', updateSize);
		updateSize();
		return () => map.off('zoom', updateSize);
	}, [map, referenceZoom]);
	return null;
};
