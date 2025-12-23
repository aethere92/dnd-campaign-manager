import L from 'leaflet';

// Singleton for invisible/interactive-only markers
export const invisibleIcon = L.divIcon({
	className: 'bg-transparent border-none',
	html: '<div style="width: 100%; height: 100%;"></div>',
	iconSize: [20, 20],
	iconAnchor: [10, 10],
	popupAnchor: [0, -10],
});

// Text Label Marker Generator
export const createTextMarker = (label, fontSize) => {
	const sizeStyle = fontSize ? `${fontSize}px` : '1.5rem';
	return L.divIcon({
		className: 'map-text-marker',
		html: `
            <div style="transform: translate(-50%, -50%); width: max-content; text-align: center; display: flex; justify-content: center; align-items: center;">
                <span style="font-family: 'Inter', sans-serif; text-transform: uppercase; font-weight: 600; font-size: ${sizeStyle}; color: #2c1a0e; text-shadow: 0 0 4px #fdfbf7, 0 0 8px #fdfbf7, 0 0 15px #fdfbf7; pointer-events: auto; cursor: pointer; white-space: nowrap;">
                    ${label}
                </span>
            </div>`,
		iconSize: [0, 0],
		iconAnchor: [0, 0],
		popupAnchor: [0, -10],
	});
};

// Custom Image Icon Generator
export const createCustomIcon = (iconName) => {
	return L.divIcon({
		className: 'custom-marker-icon',
		html: `
            <div class="group relative flex flex-col items-center">
                <div class="w-8 h-8 transition-transform group-hover:-translate-y-1 duration-200">
                    <img src="${import.meta.env.BASE_URL}images/custom-icons/${iconName}.png" 
                         class="w-full h-full object-contain drop-shadow-md filter" />
                </div>
            </div>`,
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -28],
	});
};

// Logic Hub: Resolves the appropriate Leaflet icon
export const resolveMarkerIcon = (marker) => {
	const { icon, type, label, fontSize } = marker;

	// 1. Text Marker (Check both 'type' and 'icon' properties per your original code)
	if (type === 'text' || icon === 'text') {
		return createTextMarker(label, fontSize);
	}

	// 2. Invisible / Null Icon (Interactive only)
	if (!icon) {
		return invisibleIcon;
	}

	// 3. Custom Image Icon (Fallback to your specific images folder)
	return createCustomIcon(icon);
};

// For session paths/dots
export const createDotIcon = (color) =>
	L.divIcon({
		className: 'path-dot',
		html: `<div style="background-color: ${color};" class="w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>`,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});
