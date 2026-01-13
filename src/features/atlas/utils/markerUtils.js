import React from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';

// ==========================================
// 1. SHAPE DEFINITIONS
// ==========================================
export const MARKER_SHAPES = {
	pin: {
		label: 'Pin',
		viewBox: '0 0 32 36',
		width: 32,
		height: 36,
		iconY: 15,
		type: 'dual',
		path: 'M16 36C16 36 32 26.5 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 26.5 16 36 16 36Z',
		innerPath: 'M16 33C16 33 29 24.5 29 16C29 8.8203 23.1797 3 16 3C8.8203 3 3 8.8203 3 16C3 24.5 16 33 16 33Z',
	},
	shield: {
		label: 'Shield',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
		path: 'M15 1L3 5v8c0 7 5 13.5 12 15 7-1.5 12-8 12-15V5l-9-4z',
	},
	circle: {
		label: 'Circle',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
		path: 'M15 2C7.8 2 2 7.8 2 15s5.8 13 13 13 13-5.8 13-13S22.2 2 15 2z',
	},
	square: {
		label: 'Square',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
		path: 'M4 4h22v22H4z',
	},
	diamond: {
		label: 'Diamond',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
		path: 'M15 2L2 15l13 13 13-13L15 2z',
	},
	arch: {
		label: 'Arch',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 14,
		type: 'standard',
		path: 'M4 30V15C4 8.92487 8.92487 4 15 4C21.0751 4 26 8.92487 26 15V30H4Z',
	},
	banner: {
		label: 'Banner',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 12,
		type: 'standard',
		path: 'M4 2v26l11-6 11 6V2H4z',
	},
	hexagon: {
		label: 'Hex',
		viewBox: '0 0 24 24',
		width: 30,
		height: 30,
		iconY: 12,
		type: 'standard',
		path: 'M21 16V8l-9-5l-9 5v8l9 5l9-5z',
	},
	tower: {
		label: 'Tower',
		viewBox: '0 0 24 24',
		width: 30,
		height: 30,
		iconY: 16,
		type: 'standard',
		path: 'M12 2L6 8v14h12V8L12 2z',
	},
	house: {
		label: 'House',
		viewBox: '0 0 24 24',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
		path: 'M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z',
	},
	sign: {
		label: 'Sign',
		viewBox: '0 0 24 24',
		width: 30,
		height: 30,
		iconY: 9,
		type: 'standard',
		path: 'M12 22v-6h5V4H7v12h5v6z',
	},
	tent: {
		label: 'Tent',
		viewBox: '0 0 24 24',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
		path: 'M3 21l9-18 9 18H3z',
	},
};

// ==========================================
// 2. ICON HELPERS
// ==========================================
export const getIconComponent = (name) => {
	if (!name) return LucideIcons.MapPin;
	if (LucideIcons[name]) return LucideIcons[name];

	const lower = name.toLowerCase();
	const found = Object.keys(LucideIcons).find((k) => k.toLowerCase() === lower);
	return found ? LucideIcons[found] : LucideIcons.HelpCircle;
};

export const getAllIconNames = () => Object.keys(LucideIcons).filter((k) => k !== 'createLucideIcon' && k !== 'icons');

const getContrastColor = (hex) => {
	if (!hex || !hex.startsWith('#')) return '#ffffff';
	const r = parseInt(hex.substr(1, 2), 16);
	const g = parseInt(hex.substr(3, 2), 16);
	const b = parseInt(hex.substr(5, 2), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? '#000000' : '#ffffff';
};

// ==========================================
// 3. MAIN MARKER RENDERER
// ==========================================
export const resolveMarkerIcon = (marker) => {
	const {
		shape = 'pin',
		icon = 'MapPin',
		color = '#d97706',
		variant = 'large',
		label,
		labelDisplay = 'hover',
		scale = 1,
	} = marker;

	// --- A. TEXT VARIANT ---
	if (variant === 'text') {
		return L.divIcon({
			className: 'custom-text-marker',
			html: `
                <div style="transform: translate(-50%, -50%) scale(${scale}); text-align: center; width: max-content;">
                    <span style="font-family: sans-serif; font-weight: 800; font-size: 14px; color: ${color}; 
                    text-shadow: 0 0 2px #000, 0 0 4px #000; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${label || 'Untitled'}
                    </span>
                </div>
            `,
			iconSize: [0, 0],
			iconAnchor: [0, 0],
		});
	}

	// --- B. SETUP ---
	const ShapeDef = MARKER_SHAPES[shape] || MARKER_SHAPES.pin;
	const IconComponent = getIconComponent(icon);
	const finalScale = scale * (variant === 'small' ? 0.6 : 1);
	const width = ShapeDef.width;
	const height = ShapeDef.height;

	// Anchor Logic
	const anchor =
		shape === 'pin' && variant === 'large'
			? [(width * finalScale) / 2, height * finalScale]
			: [(width * finalScale) / 2, (height * finalScale) / 2];

	// --- C. ICON ONLY ---
	if (variant === 'icon') {
		const iconHtml = renderToString(
			React.createElement(IconComponent, {
				size: 24,
				strokeWidth: 2.5,
				color: color,
				fill: 'currentColor',
				fillOpacity: 0.2,
			})
		);
		return L.divIcon({
			className: 'marker-icon-only',
			html: `<div style="transform: scale(${scale}); filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));">${iconHtml}</div>`,
			iconSize: [24, 24],
			iconAnchor: [12, 12],
		});
	}

	// --- D. SHAPE VARIANT ---
	const contrastColor = getContrastColor(color);
	const innerIconHtml = renderToString(
		React.createElement(IconComponent, {
			size: 14,
			strokeWidth: 2.5,
			color: contrastColor,
		})
	);

	let svgContent = '';
	if (ShapeDef.type === 'dual') {
		svgContent = `
            <path d="${ShapeDef.path}" fill="white" />
            <path d="${ShapeDef.innerPath}" fill="${color}" />
            <circle cx="16" cy="16" r="10" fill="white" fill-opacity="0.2" style="pointer-events: none;" />
        `;
	} else {
		svgContent = `<path d="${ShapeDef.path}" fill="${color}" stroke="white" stroke-width="2" stroke-linejoin="round" />`;
	}

	const html = `
        <div class="marker-shape relative transition-transform"
             style="width: ${width}px; height: ${height}px; transform: scale(${finalScale}); filter: drop-shadow(0 3px 3px rgba(0,0,0,0.3));">
            <svg viewBox="${ShapeDef.viewBox}" width="100%" height="100%" style="overflow: visible;">${svgContent}</svg>
            ${
							variant !== 'small'
								? `
                <div style="position: absolute; top: ${ShapeDef.iconY}px; left: 50%; transform: translate(-50%, -50%); 
                            display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
                    ${innerIconHtml}
                </div>`
								: ''
						}
        </div>
    `;

	// --- E. LABEL ---
	let labelHtml = '';
	if (label && labelDisplay !== 'none') {
		const visibleClass = labelDisplay === 'hover' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100';
		const topOffset = shape === 'pin' && variant === 'large' ? '100%' : '50%';
		labelHtml = `
            <div class="absolute left-1/2 -translate-x-1/2 ${visibleClass} transition-opacity duration-200 z-50 pointer-events-none"
                 style="top: ${topOffset}; margin-top: 6px;">
                <span class="bg-zinc-900/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap border border-white/10">
                    ${label}
                </span>
            </div>
        `;
	}

	return L.divIcon({
		className: 'custom-composite-marker group',
		html: `<div style="position: relative;">${html}${labelHtml}</div>`,
		iconSize: [width * finalScale, height * finalScale],
		iconAnchor: anchor,
	});
};

export { LucideIcons };

// ==========================================
// 4. EDITOR HANDLES (RESTORED)
// ==========================================

export const createLabelIcon = (text, options) => {
	// This handles the Area Labels
	const { color = '#fff', fontSize = 16, rotation = 0, bgColor = '#000', bgOpacity = 0, isSelected } = options || {};

	return L.divIcon({
		className: 'area-label-icon',
		html: `
            <div style="
                transform: translate(-50%, -50%) rotate(${rotation}deg); 
                text-align: center; 
                pointer-events: auto; 
                width: max-content;
                color: ${color};
                font-size: ${fontSize}px;
                font-weight: bold;
                text-shadow: 0 0 3px black;
                background: ${bgOpacity > 0 ? bgColor : 'transparent'};
                padding: ${bgOpacity > 0 ? '2px 6px' : '0'};
                border-radius: 4px;
                opacity: ${bgOpacity > 0 ? bgOpacity : 1};
                border: ${isSelected ? '1px dashed #3b82f6' : 'none'};
            ">
                ${text}
            </div>
        `,
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	});
};

export const createDotIcon = (color) =>
	L.divIcon({
		className: 'path-dot',
		html: `<div style="background-color: ${color};" class="w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>`,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});

export const createMidpointIcon = () =>
	L.divIcon({
		className: 'midpoint-handle',
		html: `<div style="width: 8px; height: 8px; background: rgba(255,255,255,0.5); border: 1px solid #3b82f6; border-radius: 50%; opacity: 0.6; transition: opacity 0.2s;"></div>`,
		iconSize: [8, 8],
		iconAnchor: [4, 4],
	});

// THIS IS THE FUNCTION THAT WAS MISSING:
export const createHandleIcon = (isSelected, isSpecial = false) => {
	const color = isSpecial ? '#3b82f6' : isSelected ? '#d97706' : '#333';
	return L.divIcon({
		className: 'vertex-handle',
		html: `<div style="width: 10px; height: 10px; background: white; border: 2px solid ${color}; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
		iconSize: [10, 10],
		iconAnchor: [5, 5],
	});
};

export const createPathHandleIcon = (isSelected, hasText) => {
	const borderColor = isSelected ? '#d97706' : hasText ? '#3b82f6' : '#000000';
	const borderWidth = hasText ? '3px' : '2px';
	const scale = isSelected ? 'scale(1.2)' : 'scale(1)';

	return L.divIcon({
		className: 'path-handle-icon',
		html: `
            <div style="
                width: 12px; 
                height: 12px; 
                background: #ffffff; 
                border: ${borderWidth} solid ${borderColor}; 
                border-radius: 50%; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.4);
                transform: ${scale};
                transition: transform 0.1s, border-color 0.2s;
            "></div>
        `,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});
};

export const createPathMidpointIcon = () =>
	L.divIcon({
		className: 'path-midpoint-icon',
		html: `
        <div style="
            width: 10px; 
            height: 10px; 
            background: #ffffff; 
            border: 2px solid #000000; 
            border-radius: 50%; 
            opacity: 0.5;
            cursor: pointer;
        "></div>
    `,
		iconSize: [10, 10],
		iconAnchor: [5, 5],
	});
