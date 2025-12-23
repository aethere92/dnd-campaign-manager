import { Polyline, Marker, Popup } from 'react-leaflet';
import { Calendar } from 'lucide-react';
import { createDotIcon } from '../../utils/markerUtils'; // Import

export const MapRecaps = ({ sessions }) => {
	if (!sessions || sessions.length === 0) return null;

	return (
		<>
			{sessions.map((session, idx) => (
				<div key={session.name}>
					<Polyline
						positions={session.points.map((p) => p.coordinates)}
						pathOptions={{ color: session.lineColor || '#d97706', weight: 3, dashArray: '8, 8', opacity: 0.7 }}
					/>

					{session.points
						.filter((p) => p.text)
						.map((point, pIdx) => (
							<Marker
								key={`${session.name}-p-${pIdx}`}
								position={point.coordinates}
								icon={createDotIcon(session.lineColor || '#d97706')}>
								<Popup>{/* ... Popup content ... */}</Popup>
							</Marker>
						))}
				</div>
			))}
		</>
	);
};
