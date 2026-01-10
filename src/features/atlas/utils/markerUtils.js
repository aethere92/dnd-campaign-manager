import React from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import {
	Skull,
	MapPin,
	Castle,
	User,
	Tent,
	Sparkles,
	Home,
	Sword,
	Anchor,
	Mountain,
	Scroll,
	Circle,
	Square,
	Star,
	Flag,
	RotateCcw, // Added this import
} from 'lucide-react';

// 1. Extended Icon Map
// Maps both semantic categories (e.g., 'combat') and direct icon names (e.g., 'skull')
const ICON_MAP = {
	// Semantic Categories
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

	// Direct Dropdown Matches
	default: MapPin,
	mappin: MapPin,
	flag: Flag,
	circle: Circle,
	square: Square,
	star: Star,
	rotateccw: RotateCcw, // New mapping
	skull: Skull,
	castle: Castle,
	user: User,
	tent: Tent,
	sparkles: Sparkles,
	home: Home,
	sword: Sword,
	anchor: Anchor,
	mountain: Mountain,
	scroll: Scroll,
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
export const createPinMarker = (IconComponent, color = '#d97706') => {
	const iconHtml = renderToString(
		React.createElement(IconComponent, {
			size: 14,
			strokeWidth: 3,
			color: 'white',
		})
	);

	return L.divIcon({
		className: 'custom-marker-container',
		html: `
            <div class="relative group" style="width: 32px; height: 36px;">
                <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.2));">
                    <path d="M16 36C16 36 32 26.5 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 26.5 16 36 16 36Z" fill="white"/>
                    <path d="M16 33C16 33 29 24.5 29 16C29 8.8203 23.1797 3 16 3C8.8203 3 3 8.8203 3 16C3 24.5 16 33 16 33Z" fill="${color}"/>
                    <circle cx="16" cy="16" r="10" fill="white" fill-opacity="0.2"/>
                </svg>
                <div class="absolute top-[8px] left-[8px] w-[16px] h-[16px] flex items-center justify-center pointer-events-none transition-transform group-hover:-translate-y-0.5">
                    ${iconHtml}
                </div>
            </div>
        `,
		iconSize: [32, 36],
		iconAnchor: [16, 36],
		popupAnchor: [0, -36],
	});
};

/**
 * Creates a "Flat" style marker (Just the icon, no pin background)
 */
export const createFlatMarker = (IconComponent, color = '#d97706') => {
	const iconHtml = renderToString(
		React.createElement(IconComponent, {
			size: 24,
			strokeWidth: 2.5,
			color: color,
			fill: color,
			fillOpacity: 0.2,
		})
	);

	return L.divIcon({
		className: 'custom-flat-marker',
		html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transition: transform 0.2s;">${iconHtml}</div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
		popupAnchor: [0, -12],
	});
};

// Text Label Marker Generator
export const createTextMarker = (label, fontSize, color = '#2c1a0e') => {
	const sizeStyle = fontSize ? `${fontSize}px` : '1.5rem';
	return L.divIcon({
		className: 'map-text-marker',
		html: `
            <div style="transform: translate(-50%, -50%); width: max-content; text-align: center; display: flex; justify-content: center; align-items: center;">
                <span style="font-family: 'Inter', sans-serif; text-transform: uppercase; font-weight: 600; font-size: ${sizeStyle}; color: ${color}; text-shadow: 0 0 4px #fff, 0 0 8px #fff; pointer-events: auto; cursor: pointer; white-space: nowrap;">
                    ${label}
                </span>
            </div>`,
		iconSize: [0, 0],
		iconAnchor: [0, 0],
		popupAnchor: [0, -10],
	});
};

/**
 * Resolve Category Default Colors
 */
const getCategoryColor = (category) => {
	const cat = category?.toLowerCase() || '';
	if (cat.includes('combat') || cat.includes('danger')) return '#dc2626'; // Red
	if (cat.includes('magic') || cat.includes('shrine')) return '#7c3aed'; // Purple
	if (['city', 'location', 'town', 'points of interest'].includes(cat)) return '#059669'; // Emerald
	if (cat.includes('city') || cat.includes('town')) return '#1e40af'; // Blue
	if (['npcs', 'people'].includes(cat)) return '#d97706'; // Orange
	return '#d97706'; // Default Amber
};

/**
 * Logic Hub: Resolves the appropriate Leaflet icon
 */
export const resolveMarkerIcon = (marker) => {
	const { icon, type, label, fontSize, category, color, iconType, customIcon } = marker;

	// 1. Text Marker
	if (type === 'text' || icon === 'text') {
		return createTextMarker(label, fontSize, color || '#2c1a0e');
	}

	// 2. Invisible
	if (!icon && !category && !customIcon) {
		return invisibleIcon;
	}

	// 3. Determine Color (Manual override > Category default)
	const finalColor = color || getCategoryColor(category);

	// 4. Determine Icon Component
	let IconComponent = ICON_MAP.default;

	// Check specific custom icon setting first (matches your Dropdown values)
	if (customIcon && ICON_MAP[customIcon]) {
		IconComponent = ICON_MAP[customIcon];
	}
	// Also check 'icon' property in case DB saves it there instead of customIcon
	else if (icon && ICON_MAP[icon]) {
		IconComponent = ICON_MAP[icon];
	}
	// Fallback to category mapping
	else {
		const normalizedCat = category?.toLowerCase() || 'default';
		for (const [key, comp] of Object.entries(ICON_MAP)) {
			if (normalizedCat.includes(key)) {
				IconComponent = comp;
				break;
			}
		}
	}

	// 5. Render Style (Pin vs Flat)
	if (iconType === 'flat') {
		return createFlatMarker(IconComponent, finalColor);
	}

	return createPinMarker(IconComponent, finalColor);
};

// For session paths/dots
export const createDotIcon = (color) =>
	L.divIcon({
		className: 'path-dot',
		html: `<div style="background-color: ${color};" class="w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>`,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});

export const createLabelIcon = (text, options = {}) => {
	const {
		color = '#ffffff',
		fontSize = 16,
		rotation = 0,
		isSelected = false,
		bgColor = 'transparent',
		bgOpacity = 0,
	} = options;

	const hexToRgb = (hex) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
	};

	const bgRgba = bgOpacity > 0 && bgColor ? `rgba(${hexToRgb(bgColor)}, ${bgOpacity})` : 'transparent';
	const padding = '4px 12px';

	return L.divIcon({
		className: 'area-label-icon',
		html: `
            <div style="
                position: relative;
                width: max-content;
                /* Scale Logic: Controlled by MapZoomHandler */
                transform: translate(-50%, -50%) rotate(${rotation}deg) scale(var(--label-scale, 1));
                transform-origin: center center;
                will-change: transform; /* Performance optimization for zoom */
                
                color: ${color};
                font-size: ${fontSize}px;
                font-family: 'Cinzel', 'Inter', ui-serif, Georgia, serif; 
                font-weight: 700;
                text-align: center;
                white-space: nowrap;
                
                cursor: ${isSelected ? 'move' : 'pointer'};
                border: ${isSelected ? '2px dashed #3b82f6' : '1px solid transparent'};
                padding: ${padding};
                background-color: ${bgRgba};
                border-radius: 6px;
                pointer-events: auto;
                
                text-shadow: ${bgOpacity < 0.3 ? '0 1px 4px rgba(0,0,0,0.9)' : 'none'};
                box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'};
                user-select: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            ">
                ${text}
            </div>
        `,
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	});
};

/**
 * Midpoint handle for splitting lines
 */
export const createMidpointIcon = () =>
	L.divIcon({
		className: 'midpoint-handle',
		html: `<div style="width: 8px; height: 8px; background: rgba(255,255,255,0.5); border: 1px solid #3b82f6; border-radius: 50%; opacity: 0.6; transition: opacity 0.2s;"></div>`,
		iconSize: [8, 8],
		iconAnchor: [4, 4],
	});
