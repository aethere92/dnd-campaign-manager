import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Calendar } from 'lucide-react';

const dotIcon = (color) =>
	L.divIcon({
		className: 'path-dot',
		html: `
        <div class="relative w-3 h-3 group">
            <div style="background-color: ${color};" class="absolute inset-0 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-150"></div>
        </div>`,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});

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
								icon={dotIcon(session.lineColor || '#d97706')}>
								<Popup>
									<div className='p-4 min-w-[200px]'>
										<div className='flex items-center gap-2 mb-2 pb-2 border-b border-border'>
											<Calendar size={14} className='text-accent' />
											<span className='text-xs font-bold uppercase text-muted-foreground'>{session.name}</span>
										</div>
										<p className='text-sm font-serif text-foreground leading-relaxed italic'>"{point.text}"</p>
									</div>
								</Popup>
							</Marker>
						))}
				</div>
			))}
		</>
	);
};
