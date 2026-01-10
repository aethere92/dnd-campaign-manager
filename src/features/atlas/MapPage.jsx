// features/atlas/MapPage.jsx
import React from 'react';
import { AtlasProvider } from './context/AtlasContext';
import { MapCanvas } from './components/MapCanvas';
import { AtlasSidebar } from './components/AtlasSidebar';

const MapView = () => {
	return (
		// relative is CRITICAL here for the absolute sidebar positioning on mobile
		<div className='flex h-full w-full relative overflow-hidden bg-background'>
			<MapCanvas />
			<AtlasSidebar />
		</div>
	);
};

export default function MapPage() {
	return (
		<AtlasProvider>
			<MapView />
		</AtlasProvider>
	);
}
