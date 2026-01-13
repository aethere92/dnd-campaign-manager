import { ImageOverlay } from 'react-leaflet';

export const MapOverlays = ({ overlays }) => {
	if (!overlays || overlays.length === 0) return null;

	// Same robust logic for the viewer
	const getUrl = (path) => {
		if (!path || typeof path !== 'string') return '';
		return path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path}`;
	};

	return (
		<>
			{overlays.map((overlay, idx) => {
				const url = getUrl(overlay.image);
				if (!url) return null;

				return <ImageOverlay key={`${overlay.name}-${idx}`} url={url} bounds={overlay.bounds} opacity={1} />;
			})}
		</>
	);
};
