import { MapContainer, TileLayer } from 'react-leaflet';
import { MAP_CONFIG } from '../mapConfig';
import { MapMarker } from './MapMarker';
import 'leaflet/dist/leaflet.css'; // Critical import for map tiles to appear

export const MapCanvas = ({ markers }) => {
	return (
		<div className='h-full w-full relative z-0'>
			<MapContainer center={MAP_CONFIG.defaultCenter} zoom={MAP_CONFIG.defaultZoom} style={MAP_CONFIG.style}>
				<TileLayer url={MAP_CONFIG.tileLayer.url} attribution={MAP_CONFIG.tileLayer.attribution} />

				{markers.map((marker) => (
					<MapMarker key={marker.id} marker={marker} />
				))}
			</MapContainer>
		</div>
	);
};
