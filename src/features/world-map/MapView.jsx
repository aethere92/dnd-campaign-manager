import { useMapData } from './useMapData';
import { MapCanvas } from './components/MapCanvas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MapView() {
	const { data, navigateToMap, isLoading, currentMapKey } = useMapData();

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center bg-[#1a1412]'>
				<LoadingSpinner text='Unrolling the parchment...' className='text-amber-500' />
			</div>
		);
	}

	return <MapCanvas data={data} onNavigate={navigateToMap} currentMapKey={currentMapKey} />;
}
