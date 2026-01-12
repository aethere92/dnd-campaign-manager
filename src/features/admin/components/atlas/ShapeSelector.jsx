import React from 'react';
import { MARKER_SHAPES } from '@/features/atlas/utils/markerUtils';
import clsx from 'clsx';

export default function ShapeSelector({ value, onChange, color = '#999' }) {
	return (
		<div className='grid grid-cols-4 gap-2'>
			{Object.entries(MARKER_SHAPES).map(([key, def]) => {
				const isActive = value === key;
				return (
					<button
						key={key}
						type='button'
						onClick={() => onChange(key)}
						title={def.label}
						className={clsx(
							'aspect-square rounded-md border flex items-center justify-center transition-all hover:bg-muted',
							isActive ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-card border-border'
						)}>
						<svg
							viewBox={def.viewBox}
							className='w-6 h-6 transition-colors'
							style={{
								fill: isActive ? color : '#e5e7eb',
								stroke: isActive ? 'none' : '#9ca3af',
								strokeWidth: 2,
							}}>
							<path d={def.path} />
						</svg>
					</button>
				);
			})}
		</div>
	);
}
