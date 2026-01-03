/* --- FILE: features/admin/components/TacticalMapManager.jsx --- */
import React, { useState, useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Trash2, Plus, Target, Save } from 'lucide-react';
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS, ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminFormStyles';
import { resolveMarkerIcon } from '@/features/atlas/utils/markerUtils';
import Button from '@/shared/components/ui/Button';

// Click handler component
const MapClickHandler = ({ onMapClick }) => {
	useMapEvents({
		click: (e) => onMapClick(e.latlng),
	});
	return null;
};

const MapController = ({ bounds }) => {
	const map = useMap();
	useEffect(() => {
		if (bounds) map.fitBounds(bounds);
	}, [map, bounds]);
	return null;
};

export default function TacticalMapManager({ imageUrl, value, onChange }) {
	const [markers, setMarkers] = useState([]);
	const [dimensions, setDimensions] = useState(null);
	const [selectedIdx, setSelectedIdx] = useState(null);

	// 1. Load existing markers from JSON string
	useEffect(() => {
		if (value) {
			try {
				const parsed = typeof value === 'string' ? JSON.parse(value) : value;
				setMarkers(Array.isArray(parsed) ? parsed : []);
			} catch (e) {
				setMarkers([]);
			}
		}
	}, [value]);

	// 2. Handle Image Dimensions
	useEffect(() => {
		if (!imageUrl) return;
		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			const h = img.height;
			const w = img.width;
			setDimensions(L.latLngBounds([-h, 0], [0, w]));
		};
	}, [imageUrl]);

	const handleMapClick = (latlng) => {
		const newMarker = {
			lat: Math.round(latlng.lat),
			lng: Math.round(latlng.lng),
			label: 'New Marker',
			category: 'default',
		};
		const updated = [...markers, newMarker];
		setMarkers(updated);
		setSelectedIdx(updated.length - 1);
		onChange(JSON.stringify(updated));
	};

	const updateMarker = (idx, fields) => {
		const updated = [...markers];
		updated[idx] = { ...updated[idx], ...fields };
		setMarkers(updated);
		onChange(JSON.stringify(updated));
	};

	const removeMarker = (idx) => {
		const updated = markers.filter((_, i) => i !== idx);
		setMarkers(updated);
		setSelectedIdx(null);
		onChange(JSON.stringify(updated));
	};

	if (!imageUrl || !dimensions) return null;

	return (
		<div className={ADMIN_SECTION_CLASS}>
			<div className={ADMIN_HEADER_CLASS}>
				<span className='flex items-center gap-2'>
					<Target size={18} className='text-primary' /> Marker Editor
				</span>
				<span className='text-[10px] text-muted-foreground uppercase tracking-widest'>Click map to add</span>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Visual Map Area */}
				<div className='lg:col-span-2 h-[400px] rounded-lg border border-border overflow-hidden bg-muted relative z-0'>
					<MapContainer
						crs={L.CRS.Simple}
						bounds={dimensions}
						zoom={-2}
						minZoom={-3}
						attributionControl={false}
						style={{ height: '100%', width: '100%', background: 'var(--background)' }}>
						<MapController bounds={dimensions} />
						<MapClickHandler onMapClick={handleMapClick} />
						<ImageOverlay url={imageUrl} bounds={dimensions} />

						{markers?.map((m, i) => (
							<Marker
								key={i}
								position={[m.lat, m.lng]}
								icon={resolveMarkerIcon(m)}
								eventHandlers={{ click: () => setSelectedIdx(i) }}
							/>
						))}
					</MapContainer>
				</div>

				{/* Sidebar Editor */}
				<div className='space-y-4'>
					<div className='max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar'>
						{markers.length === 0 && (
							<div className='text-center py-10 text-xs text-muted-foreground italic border-2 border-dashed border-border rounded-lg'>
								No markers yet. Click the map to start.
							</div>
						)}
						{markers.map((m, i) => (
							<div
								key={i}
								className={`p-3 rounded-lg border transition-all ${
									selectedIdx === i ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border bg-background'
								}`}
								onClick={() => setSelectedIdx(i)}>
								<div className='flex justify-between items-start mb-2'>
									<span className='text-[10px] font-bold text-muted-foreground uppercase'>Marker #{i + 1}</span>
									<button onClick={() => removeMarker(i)} className='text-muted-foreground hover:text-red-600'>
										<Trash2 size={14} />
									</button>
								</div>
								<div className='space-y-2'>
									<input
										className={ADMIN_INPUT_CLASS}
										value={m.label}
										onChange={(e) => updateMarker(i, { label: e.target.value })}
										placeholder='Label...'
									/>
									<select
										className={ADMIN_INPUT_CLASS}
										value={m.category}
										onChange={(e) => updateMarker(i, { category: e.target.value })}>
										<option value='default'>Default Pin</option>
										<option value='combat'>Combat / Danger</option>
										<option value='city'>City / Settlement</option>
										<option value='npc'>NPC / Person</option>
										<option value='magic'>Magic / Mystery</option>
										<option value='quest'>Objective</option>
										<option value='location'>Location</option>
									</select>
									<div className='flex gap-2 text-[9px] font-mono text-muted-foreground'>
										<span>LAT: {m.lat}</span>
										<span>LNG: {m.lng}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
