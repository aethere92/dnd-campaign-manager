import React from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Skull, MapPin, Castle, User, Tent, Sparkles, Home, Sword, Anchor, Mountain, Scroll } from 'lucide-react';

// 1. Map your category strings to Lucide Components
const ICON_MAP = {
	combat: Skull,
	danger: Skull,
	encounter: Sword,
	city: Castle,
	town: Home,
	village: Home,
	npc: User,
	people: User,
	camp: Tent,
	magic: Sparkles,
	shrine: Sparkles,
	port: Anchor,
	landmark: MapPin,
	dungeon: Mountain,
	quest: Scroll,
	default: MapPin,
};

// Singleton for invisible/interactive-only markers
export const invisibleIcon = L.divIcon({
	className: 'bg-transparent border-none',
	html: '<div style="width: 100%; height: 100%;"></div>',
	iconSize: [20, 20],
	iconAnchor: [10, 10],
	popupAnchor: [0, -10],
});

/**
 * Creates a "Pin" style marker using a Lucide React Icon
 */
export const createLucideMarker = (category, color = '#d97706') => {
	const normalized = category?.toLowerCase() || 'default';
	let IconComponent = ICON_MAP.default;
	for (const [key, comp] of Object.entries(ICON_MAP)) {
		if (normalized.includes(key)) {
			IconComponent = comp;
			break;
		}
	}

	const iconHtml = renderToString(
		React.createElement(IconComponent, {
			size: 14,
			strokeWidth: 3,
			color: 'white',
		})
	);

	/**
	 * STABLE SVG PIN
	 * The point is exactly at 16, 36.
	 * The circle center is at 16, 16.
	 */
	return L.divIcon({
		className: 'custom-marker-container',
		html: `
            <div class="relative group" style="width: 32px; height: 36px;">
                <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.2));">
                    <!-- Pin Body -->
                    <path d="M16 36C16 36 32 26.5 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 26.5 16 36 16 36Z" fill="white"/>
                    <path d="M16 33C16 33 29 24.5 29 16C29 8.8203 23.1797 3 16 3C8.8203 3 3 8.8203 3 16C3 24.5 16 33 16 33Z" fill="${color}"/>
                    <!-- Inner Hole -->
                    <circle cx="16" cy="16" r="10" fill="white" fill-opacity="0.2"/>
                </svg>
                <!-- Icon Overlay -->
                <div class="absolute top-[8px] left-[8px] w-[16px] h-[16px] flex items-center justify-center pointer-events-none transition-transform group-hover:-translate-y-0.5">
                    ${iconHtml}
                </div>
            </div>
        `,
		iconSize: [32, 36],
		iconAnchor: [16, 36], // EXACT BOTTOM CENTER
		popupAnchor: [0, -36],
	});
};

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

/**
 * Logic Hub: Resolves the appropriate Leaflet icon
 */
export const resolveMarkerIcon = (marker) => {
	const { icon, type, label, fontSize, category } = marker;

	// 1. Existing Text Marker logic
	if (type === 'text' || icon === 'text') {
		return createTextMarker(label, fontSize);
	}

	// 2. Invisible / Null Icon
	if (!icon && !category) {
		return invisibleIcon;
	}

	// 3. Lucide Marker logic
	let markerColor = '#d97706';
	const cat = category?.toLowerCase() || '';
	if (cat.includes('combat') || cat.includes('danger')) markerColor = '#dc2626'; // Red
	if (cat.includes('magic') || cat.includes('shrine')) markerColor = '#7c3aed'; // Purple
	if (['city', 'location', 'town', 'points of interest'].includes(cat)) markerColor = '#059669'; // Emerald
	if (cat.includes('city') || cat.includes('town')) markerColor = '#1e40af'; // Blue
	if (['npcs', 'people'].includes(cat)) markerColor = '#d97706'; // Orange

	return createLucideMarker(category, markerColor);
};

// For session paths/dots
export const createDotIcon = (color) =>
	L.divIcon({
		className: 'path-dot',
		html: `<div style="background-color: ${color};" class="w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>`,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});
