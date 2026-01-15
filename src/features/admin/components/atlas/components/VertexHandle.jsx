// --- FILE: components/VertexHandle.jsx ---
import L from 'leaflet';

export const createHandleIcon = (isSelected, isSpecial = false) => {
	const color = isSpecial ? '#3b82f6' : isSelected ? '#d97706' : '#333';
	return L.divIcon({
		className: 'vertex-handle',
		html: `<div style="width: 10px; height: 10px; background: white; border: 2px solid ${color}; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
		iconSize: [10, 10],
		iconAnchor: [5, 5],
	});
};

// NEW: Shared Move Handle (Glassmorphism style with arrows)
export const createMoveHandleIcon = () => {
	return L.divIcon({
		className: 'move-handle',
		html: `
            <div style="
                width: 24px; 
                height: 24px; 
                background: rgba(59, 130, 246, 0.9); 
                border: 2px solid white; 
                border-radius: 4px; 
                cursor: move; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20"/>
                </svg>
            </div>
        `,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	});
};
