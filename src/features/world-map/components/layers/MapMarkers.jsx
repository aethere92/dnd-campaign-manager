import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ArrowRight, MapPin, Skull, Castle, User, Tent, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const iconCache = {};

// Singleton for invisible/interactive-only markers
const invisibleIcon = L.divIcon({
	className: 'bg-transparent border-none',
	html: '<div style="width: 100%; height: 100%;"></div>',
	iconSize: [20, 20],
	iconAnchor: [10, 10],
	popupAnchor: [0, -10],
});

// Helper to resolve Lucide Icons based on Category
const getCategoryIcon = (category) => {
	const cat = category?.toLowerCase() || '';
	if (cat.includes('combat') || cat.includes('danger') || cat.includes('encounter')) return Skull;
	if (cat.includes('citie') || cat.includes('town')) return Castle;
	if (cat.includes('npc') || cat.includes('people')) return User;
	if (cat.includes('camp')) return Tent;
	if (cat.includes('magic') || cat.includes('shrine')) return Sparkles;
	return MapPin;
};

// Unified Marker Icon Generator
const getMarkerIcon = (marker) => {
	const { icon, type, label, fontSize } = marker;

	// 1. Text Label Marker (Check both 'type' and 'icon' properties)
	if (type === 'text' || icon === 'text') {
		// Use provided fontSize or default to 1.5rem
		const sizeStyle = fontSize ? `${fontSize}px` : '1.5rem';

		return L.divIcon({
			className: 'map-text-marker', // Uses the CSS class added to index.css
			html: `
                <div style="
                    transform: translate(-50%, -50%); 
                    width: max-content; 
                    text-align: center;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                ">
                    <span style="
                        font-family: 'Inter', sans-serif;
						text-transform: uppercase; 
                        font-weight: 600; 
                        font-size: ${sizeStyle}; 
                        color: #2c1a0e; 
                        text-shadow: 0 0 4px #fdfbf7, 0 0 8px #fdfbf7, 0 0 15px #fdfbf7;
                        pointer-events: auto;
                        cursor: pointer;
                        white-space: nowrap;
                    ">
                        ${label}
                    </span>
                </div>
            `,
			iconSize: [0, 0],
			iconAnchor: [0, 0],
			popupAnchor: [0, -10],
		});
	}

	// 2. Invisible / Null Icon (Interactive only)
	// We check this AFTER text, because text markers might have icon: null
	if (!icon) {
		return invisibleIcon;
	}

	// 3. Custom Image Icon
	if (iconCache[icon]) return iconCache[icon];

	const newIcon = L.divIcon({
		className: 'custom-marker-icon',
		html: `
            <div class="group relative flex flex-col items-center">
                <div class="w-8 h-8 transition-transform group-hover:-translate-y-1 duration-200">
                    <img src="${import.meta.env.BASE_URL}images/custom-icons/${icon}.png" 
                         class="w-full h-full object-contain drop-shadow-md filter" />
                </div>
            </div>
        `,
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -28],
	});

	iconCache[icon] = newIcon;
	return newIcon;
};

export const MapMarkers = ({ markers, onNavigate }) => {
	if (!markers || markers.length === 0) return null;

	return (
		<>
			{markers.map((marker, idx) => {
				const Icon = getCategoryIcon(marker.category);

				return (
					<Marker key={`${marker.label}-${idx}`} position={marker.position} icon={getMarkerIcon(marker)}>
						<Popup closeButton={true}>
							<div className='flex flex-col w-[260px] font-sans bg-background'>
								<div className='px-4 pt-4 pb-2 pr-7 flex items-start justify-between gap-3'>
									<div>
										<span className='text-[10px] font-bold uppercase tracking-wider text-amber-600/90 block mb-1'>
											{marker.category}
										</span>
										<h3 className='font-serif font-bold text-xl leading-none text-foreground'>{marker.label}</h3>
									</div>
									<div className='shrink-0 p-1.5 rounded-lg shadow-sm border border-amber-200 bg-amber-50 text-amber-700'>
										<Icon size={16} strokeWidth={2} />
									</div>
								</div>

								<div className='h-px w-full bg-border/50 my-1' />

								<div className='px-4 py-2'>
									{marker.description ? (
										<p className='text-xs text-gray-600 leading-relaxed line-clamp-6'>{marker.description}</p>
									) : (
										<p className='text-xs text-gray-400 italic'>No details available.</p>
									)}
								</div>

								{marker.mapLink && (
									<div className='mt-2 bg-muted/50 p-2 border-t border-border flex justify-end rounded-b-lg'>
										<button
											onClick={() => onNavigate(marker.mapLink)}
											className='text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors uppercase tracking-wide'>
											Enter Location <ArrowRight size={10} />
										</button>
									</div>
								)}
							</div>
						</Popup>
					</Marker>
				);
			})}
		</>
	);
};
