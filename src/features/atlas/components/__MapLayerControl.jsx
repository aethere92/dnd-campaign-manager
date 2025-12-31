import { useState, useEffect, useRef } from 'react';
import { Layers, ChevronDown, ChevronRight, Eye, EyeOff, Check } from 'lucide-react';
import { clsx } from 'clsx';
import L from 'leaflet';

// Reusable styled Group Header matching Sidebar aesthetics
const Group = ({ label, icon: Icon, children, defaultOpen = true }) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	if (!children || children.length === 0) return null;

	return (
		<div className='mb-2'>
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(!isOpen);
				}}
				className='flex items-center w-full text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-amber-700 transition-colors mb-1 select-none font-sans'>
				<span className='mr-1 opacity-70'>{isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}</span>
				<span className='flex items-center gap-1.5'>
					{Icon && <Icon size={12} />}
					{label}
				</span>
			</button>
			{isOpen && <div className='pl-2 space-y-0.5 border-l border-black/5 ml-1'>{children}</div>}
		</div>
	);
};

// Toggle Item with explicit Checkmark UI
const ToggleItem = ({ label, checked, onChange }) => (
	<div
		className='flex items-center gap-2 cursor-pointer group px-2 py-1 hover:bg-black/5 rounded-md transition-colors select-none'
		onClick={(e) => {
			e.stopPropagation();
			onChange();
		}}>
		{/* Custom Checkbox UI - Reduced size */}
		<div
			className={clsx(
				'w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all shadow-sm shrink-0',
				checked ? 'bg-amber-600 border-amber-700 text-white' : 'bg-card border-border group-hover:border-amber-400'
			)}>
			{checked && <Check size={10} strokeWidth={3.5} />}
		</div>

		<span
			className={clsx(
				'text-[11px] font-medium leading-tight pt-0.5 font-sans',
				checked ? 'text-foreground' : 'text-muted-foreground'
			)}>
			{label}
		</span>
	</div>
);

export const MapLayerControl = ({ groups, visibility, toggleLayer }) => {
	const [expanded, setExpanded] = useState(true);
	const containerRef = useRef(null);

	// Prevent Leaflet map interactions when clicking inside this control
	useEffect(() => {
		if (containerRef.current) {
			L.DomEvent.disableClickPropagation(containerRef.current);
			L.DomEvent.disableScrollPropagation(containerRef.current);
		}
	}, []);

	return (
		<div className='leaflet-top leaflet-right font-sans' style={{ pointerEvents: 'none', zIndex: 1000 }}>
			<div
				ref={containerRef}
				className={clsx(
					'leaflet-control m-3 transition-all duration-200 ease-in-out',
					// Theme colors
					'bg-[#fdfbf7] border border-[#c9c2b8] rounded-lg shadow-xl overflow-hidden'
				)}
				style={{ pointerEvents: 'auto' }}>
				{/* Header */}
				<div
					className='flex items-center justify-between p-2.5 bg-[#f2efe9] border-b border-[#c9c2b8] cursor-pointer min-w-[180px]'
					onClick={() => setExpanded(!expanded)}>
					<div className='flex items-center gap-2 text-xs font-serif font-bold text-amber-900'>
						<Layers size={14} />
						<span>Atlas Layers</span>
					</div>
					<button className='p-0.5 hover:bg-black/5 rounded text-amber-900/70'>
						{expanded ? <Eye size={12} /> : <EyeOff size={12} />}
					</button>
				</div>

				{/* Content */}
				{expanded && (
					<div className='p-2 max-h-[60vh] overflow-y-auto w-56 custom-scrollbar bg-background/50'>
						{groups.overlays?.length > 0 && (
							<Group label='Overlays' icon={groups.icons.overlays} defaultOpen={false}>
								{groups.overlays.map((l) => (
									<ToggleItem
										key={l.id}
										label={l.label}
										checked={!!visibility[l.id]}
										onChange={() => toggleLayer(l.id)}
									/>
								))}
							</Group>
						)}

						{groups.sessions?.length > 0 && (
							<Group label='Journal & Paths' icon={groups.icons.sessions} defaultOpen={false}>
								{groups.sessions.map((l) => (
									<ToggleItem
										key={l.id}
										label={l.label}
										checked={!!visibility[l.id]}
										onChange={() => toggleLayer(l.id)}
									/>
								))}
							</Group>
						)}

						{groups.markers?.length > 0 && (
							<Group label='Map Markers' icon={groups.icons.markers} defaultOpen={true}>
								{groups.markers.map((cat) => (
									<ToggleItem
										key={cat.id}
										label={cat.label}
										checked={!!visibility[cat.id]}
										onChange={() => toggleLayer(cat.id)}
									/>
								))}
							</Group>
						)}

						<div className='mt-2 pt-2 border-t border-black/5'>
							<ToggleItem
								label='Show Areas & Regions'
								checked={!!visibility['areas']}
								onChange={() => toggleLayer('areas')}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
