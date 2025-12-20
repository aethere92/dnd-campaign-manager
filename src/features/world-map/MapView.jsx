import { useMapData } from './useMapData';
import { MapCanvas } from './components/MapCanvas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import L from 'leaflet'; // ADD THIS
import 'leaflet/dist/leaflet.css'; // ADD THIS

// ADD THIS FIX BEFORE THE COMPONENT
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
	iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView() {
	const { markers, isLoading } = useMapData();

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center bg-gray-900'>
				<LoadingSpinner text='Loading Atlas...' className='text-gray-400' />
			</div>
		);
	}

	return (
		// Height wrapper is critical for Leaflet
		<div style={{ height: '100%', width: '100%' }}>
			<MapCanvas markers={markers} />
		</div>
	);
}
