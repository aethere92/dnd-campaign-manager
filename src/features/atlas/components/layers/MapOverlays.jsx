import { ImageOverlay } from 'react-leaflet';

export const MapOverlays = ({ overlays }) => {
	if (!overlays || overlays.length === 0) return null;

	return (
		<>
			{overlays.map((overlay, idx) => (
				<ImageOverlay
					key={`${overlay.name}-${idx}`}
					url={`${import.meta.env.BASE_URL}${overlay.image}`}
					bounds={overlay.bounds}
					opacity={1}
				/>
			))}
		</>
	);
};
