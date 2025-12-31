import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Maximize, Minimize, Crosshair } from 'lucide-react';
import { clsx } from 'clsx';

export const MapTools = ({ bounds, containerRef }) => {
	const map = useMap();
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Sync state if user presses ESC or browser exit
	useEffect(() => {
		const onFullScreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener('fullscreenchange', onFullScreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
	}, []);

	const handleCenter = (e) => {
		e.stopPropagation();
		if (bounds) {
			map.fitBounds(bounds, { animate: true, duration: 1 });
		}
	};

	const toggleFullscreen = (e) => {
		e.stopPropagation();
		if (!containerRef?.current) return;

		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	// Reusable Button Style
	const Btn = ({ onClick, icon: Icon, title, active }) => (
		<button
			onClick={onClick}
			title={title}
			className={clsx(
				'flex items-center justify-center w-8 h-8 transition-colors first:rounded-t-md last:rounded-b-md border-b last:border-b-0',
				// FIX: Semantic Theme Colors
				'bg-card border-border text-muted-foreground hover:bg-muted hover:text-primary',
				active && 'bg-primary/10 text-primary'
			)}>
			<Icon size={16} strokeWidth={2.5} />
		</button>
	);

	return (
		<div className='leaflet-top leaflet-left'>
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
