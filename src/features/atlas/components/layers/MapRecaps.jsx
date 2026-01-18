/* --- FILE: features/atlas/components/layers/MapRecaps.jsx --- */
import React, { useMemo, useRef, useState } from 'react';
import { Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import { Calendar } from 'lucide-react';
import { createDotIcon, createPathPointIcon } from '@/features/atlas/utils/markerUtils';
import { getSmoothPath } from '@/features/atlas/utils/pathUtils';
import { TextAlongPath } from '@/features/atlas/components/layers/TextAlongPath';

const PathRenderer = ({ session }) => {
	const polylineRef = useRef(null);
	const [isHovered, setIsHovered] = useState(false);

	// 1. Calculate Geometry
	// Handle both {coordinates:[]} objects and raw arrays
	const rawPositions = (session.points || []).map((p) => p.coordinates || p);

	const positions = useMemo(() => {
		if (session.curviness > 0 && rawPositions.length > 1) {
			return getSmoothPath(rawPositions, session.curviness);
		}
		return rawPositions;
	}, [rawPositions, session.curviness]);

	if (!positions || positions.length === 0) return null;

	const color = session.color || '#d97706';
	const weight = session.weight || 4;
	const opacity = session.opacity || 0.8;
	const dashArray = session.dashArray || null;

	const hasTextAlongLine = !!session.textAlongLine;
	const showTooltip = session.name && session.labelDisplay !== 'none' && !hasTextAlongLine;

	// Calculate Visibility
	let isTextVisible = false;
	if (hasTextAlongLine && session.labelDisplay !== 'none') {
		if (session.labelDisplay === 'always') isTextVisible = true;
		// Show on hover OR if we force it via props (optional)
		else if (session.labelDisplay === 'hover') isTextVisible = isHovered;
	}

	return (
		<React.Fragment>
			<Polyline
				ref={polylineRef}
				positions={positions}
				pathOptions={{
					color,
					weight,
					opacity,
					dashArray,
					lineCap: 'round',
					lineJoin: 'round',
				}}
				eventHandlers={{
					mouseover: () => setIsHovered(true),
					mouseout: () => setIsHovered(false),
				}}>
				{showTooltip && (
					<Tooltip
						permanent={session.labelDisplay === 'always'}
						direction='center'
						className={session.labelStyle === 'ghost' ? 'leaflet-tooltip-ghost' : 'leaflet-tooltip-box'}
						opacity={session.labelDisplay === 'hover' ? 0.9 : 1}
						sticky>
						<span className='font-bold text-xs font-serif'>{session.name}</span>
					</Tooltip>
				)}

				{hasTextAlongLine && session.name && (
					<TextAlongPath
						layerRef={polylineRef}
						text={session.name}
						visible={isTextVisible}
						style={{
							color: '#ffffff',
							strokeColor: color,
							opacity: 1,
							fontSize: 13,
							fontWeight: 800,
						}}
					/>
				)}
			</Polyline>

			{/* Narrative Points & Icons */}
			{session.points.map((point, idx) => {
				// RENDER IF: Has Text OR Has Icon
				if (!point.text && (!point.icon || point.icon === 'default')) return null;

				const coords = point.coordinates || point;

				// Determine Icon
				let icon;
				if (point.icon && point.icon !== 'default') {
					// Use custom icon with path color
					icon = createPathPointIcon(point.icon, color);
				} else {
					// Fallback to simple dot for text-only nodes
					icon = createDotIcon(color);
				}

				return (
					<Marker key={`${session.name}-p-${idx}`} position={coords} icon={icon}>
						{/* Only show popup if there is text */}
						{point.text && (
							<Popup closeButton={false} className='custom-popup-clean' maxWidth={240}>
								<div className='flex flex-col w-full font-sans bg-background rounded-md overflow-hidden shadow-sm border border-border/50'>
									<div className='px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2'>
										<Calendar size={12} className='text-primary' />
										<span className='text-[10px] font-bold uppercase tracking-wider text-primary'>{session.name}</span>
									</div>
									<div className='p-3 text-xs text-foreground/90 leading-snug'>{point.text}</div>
								</div>
							</Popup>
						)}
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
