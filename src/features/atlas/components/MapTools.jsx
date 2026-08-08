import { useMap } from 'react-leaflet';
import { Maximize, Minimize, Crosshair } from 'lucide-react';
import { clsx } from 'clsx';
import { useFullscreen } from '@/shared/hooks/useFullscreen';

// Declared at module scope, not inside MapTools. A component defined in a render
// body is a fresh type each render, so React remounts it every time.
const Btn = ({ onClick, icon: Icon, title, active }) => (
	<button
		onClick={onClick}
		title={title}
		className={clsx(
			'flex items-center justify-center w-8 h-8 transition-colors first:rounded-t-md last:rounded-b-md border-b last:border-b-0',
			'bg-card border-border text-muted-foreground hover:bg-muted hover:text-primary',
			active && 'bg-primary/10 text-primary'
		)}>
		<Icon size={16} strokeWidth={2.5} />
	</button>
);

export const MapTools = ({ bounds, containerRef }) => {
	const map = useMap();
	const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);

	const handleCenter = (e) => {
		e.stopPropagation();
		if (bounds) {
			map.fitBounds(bounds, { animate: true, duration: 1 });
		}
	};

	return (
		<div className='hidden md:flex md:flex-col leaflet-top leaflet-left'>
			<div className='leaflet-control leaflet-bar !border-0 !shadow-xl !m-3 rounded-md overflow-hidden border border-border/50'>
				<Btn onClick={handleCenter} icon={Crosshair} title='Center Map' />
				<Btn
					onClick={toggleFullscreen}
					icon={isFullscreen ? Minimize : Maximize}
					title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
					active={isFullscreen}
				/>
			</div>
		</div>
	);
};
