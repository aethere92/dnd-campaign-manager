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
							'aspect-square rounded-lg border flex items-center justify-center transition-all hover:bg-muted/50',
							isActive ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card border-border text-muted-foreground'
						)}>
						<svg
							viewBox={def.viewBox}
							className='w-6 h-6 transition-all'
							style={{
								fill: isActive ? color : 'currentColor',
								stroke: isActive ? 'none' : 'currentColor',
								opacity: isActive ? 1 : 0.5,
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
