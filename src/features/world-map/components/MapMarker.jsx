import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // ADD THIS

export const MapMarker = ({ marker }) => {
	return (
		<Marker position={marker.position}>
			<Popup>
				<div className='text-sm'>
					<strong className='block font-serif text-foreground'>{marker.label}</strong>
					<span className='text-xs text-gray-500 capitalize'>{marker.description}</span>
				</div>
			</Popup>
		</Marker>
	);
};
