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
