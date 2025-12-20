import { Polygon, Tooltip } from 'react-leaflet';

export const MapAreas = ({ areas }) => {
	if (!areas || areas.length === 0) return null;

	return (
		<>
			{areas.map((area, idx) => (
				<Polygon
					key={`${area.name}-${idx}`}
					positions={area.positions}
					pathOptions={{
						color: area.lineColor || 'transparent',
						fillColor: area.interiorColor || '#ff0000',
						fillOpacity: 0.3,
						weight: 1,
					}}>
					<Tooltip
						permanent
						direction='center'
						className='bg-transparent border-0 shadow-none font-serif text-lg font-bold text-white drop-shadow-md text-center'>
						<div style={{ transform: `rotate(${area.textRotation || '0deg'})` }}>{area.name}</div>
					</Tooltip>
				</Polygon>
			))}
		</>
	);
};
