import React, { useMemo } from 'react';
import { Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Calendar } from 'lucide-react';
import { createDotIcon } from '@/features/atlas/utils/markerUtils';
import { getSmoothPath } from '@/features/atlas/utils/pathUtils';

const PathRenderer = ({ session }) => {
	// 1. Calculate Geometry (Smooth vs Raw)
	const rawPositions = session.points.map((p) => p.coordinates);

	const positions = useMemo(() => {
		if (session.curviness > 0 && rawPositions.length > 1) {
			return getSmoothPath(rawPositions, session.curviness);
		}
		return rawPositions;
	}, [rawPositions, session.curviness]);

	if (!positions || positions.length === 0) return null;

	// 2. Resolve Styles
	const color = session.color || '#d97706';
	const weight = session.weight || 4;
	const opacity = session.opacity || 0.8;
	const dashArray = session.dashArray || null;

	return (
		<React.Fragment>
			{/* The Path Itself */}
			<Polyline
				positions={positions}
				pathOptions={{
					color,
					weight,
					opacity,
					dashArray,
					lineCap: 'round',
					lineJoin: 'round',
				}}>
				{/* Main Path Label (e.g. "Journey to Brindol") */}
				{session.name && session.labelDisplay !== 'none' && (
					<Tooltip
						permanent={session.labelDisplay === 'always'}
						direction='center'
						className='path-tooltip'
						opacity={session.labelDisplay === 'hover' ? 0.9 : 1}
						sticky>
						<span className='font-bold text-xs font-serif'>{session.name}</span>
					</Tooltip>
				)}
			</Polyline>

			{/* Narrative Points (The "Recap" Bubbles) */}
			{session.points.map((point, idx) => {
				if (!point.text) return null; // Only render if text exists

				return (
					<Marker
						key={`${session.name}-p-${idx}`}
						position={point.coordinates}
						icon={createDotIcon(color)} // Small dot to indicate a story moment
					>
						<Popup closeButton={false} className='custom-popup-clean' maxWidth={240}>
							<div className='flex flex-col w-full font-sans bg-background rounded-md overflow-hidden shadow-sm border border-border/50'>
								{/* Header */}
								<div className='px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2'>
									<Calendar size={12} className='text-primary' />
									<span className='text-[10px] font-bold uppercase tracking-wider text-primary'>{session.name}</span>
								</div>

								{/* Content */}
								<div className='p-3 text-xs text-foreground/90 leading-snug'>{point.text}</div>
							</div>
						</Popup>
					</Marker>
				);
			})}
		</React.Fragment>
	);
};

export const MapRecaps = ({ sessions }) => {
	if (!sessions || sessions.length === 0) return null;

	return (
		<>
			{sessions.map((session, idx) => (
				<PathRenderer key={session.id || idx} session={session} />
			))}
		</>
	);
};
