import { Fragment } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import { Calendar } from 'lucide-react';
import { createDotIcon } from '@/features/atlas/utils/markerUtils';

export const MapRecaps = ({ sessions }) => {
	if (!sessions || sessions.length === 0) return null;

	return (
		<>
			{sessions.map((session, idx) => (
				<Fragment key={session.name}>
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
								<Popup closeButton={false} className='leaflet-popup-clean'>
									<div className='flex flex-col w-[200px] font-sans bg-background rounded-md overflow-hidden shadow-sm border border-border/50'>
										{/* Header */}
										<div className='px-3 py-2 bg-amber-500/10/80 border-b border-amber-100/50 flex items-center gap-2'>
											<Calendar size={12} className='text-amber-700' />
											<span className='text-[10px] font-bold uppercase tracking-wider text-amber-900'>
												{session.name}
											</span>
										</div>

										{/* Content */}
										<div className='p-3 text-xs text-foreground/80 leading-snug'>{point.text}</div>
									</div>
								</Popup>
							</Marker>
						))}
				</Fragment>
			))}
		</>
	);
};
