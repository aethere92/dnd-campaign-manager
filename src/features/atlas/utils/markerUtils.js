import React from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import {
	// Generics
	MapPin,
	Shield,
	Circle,
	Square,
	Triangle,
	Bookmark,
	Flag,
	Star,
	Ghost,
	HelpCircle,
	Hexagon,
	Target,
	Gem,
	Crown,
	Key,
	Lock,
	Eye,
	Zap,
	Flame,
	Droplet,
	Feather,
	Book,

	// RPG / Fantasy
	Skull,
	Sword,
	Castle,
	User,
	Tent,
	Sparkles,
	Home,
	Anchor,
	Mountain,
	Scroll,
	Hammer,
	Axe,
	Coins,
	RotateCcw,
	AlertCircle,
	Type,

	// NEW REQUESTS
	Trees,
	Globe,
	Landmark,
} from 'lucide-react';

// --- 1. SHAPE DEFINITIONS ---
export const MARKER_SHAPES = {
	pin: {
		label: 'Pin',
		// Exact SVG from User
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
		path: 'M15 1L3 5v8c0 7 5 13.5 12 15 7-1.5 12-8 12-15V5l-9-4z',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
	},
	circle: {
		label: 'Circle',
		path: 'M15 2C7.8 2 2 7.8 2 15s5.8 13 13 13 13-5.8 13-13S22.2 2 15 2z',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
	},
	square: {
		label: 'Square',
		path: 'M4 4h22v22H4z',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
		type: 'standard',
	},
	diamond: {
		label: 'Diamond',
		path: 'M15 2L2 15l13 13 13-13L15 2z',
		viewBox: '0 0 30 30',
		width: 30,
		height: 30,
		iconY: 15,
	},
};

// --- 2. ICON REGISTRY ---
export const ICON_MAP = {
	default: MapPin,
	text: Type,
	star: Star,
	flag: Flag,
	circle: Circle,
	square: Square,
	triangle: Triangle,
	bookmark: Bookmark,
	help: HelpCircle,
	target: Target,
	skull: Skull,
	sword: Sword,
	shield: Shield,
	castle: Castle,
	home: Home,
	tent: Tent,
	user: User,
	sparkles: Sparkles,
	anchor: Anchor,
	mountain: Mountain,
	scroll: Scroll,
	ghost: Ghost,
	gem: Gem,
	crown: Crown,
	key: Key,
	lock: Lock,
	eye: Eye,
	zap: Zap,
	flame: Flame,
	droplet: Droplet,
	feather: Feather,
	book: Book,
	hammer: Hammer,
	axe: Axe,
	coins: Coins,
	rotate: RotateCcw,
	alert: AlertCircle,
	trees: Trees,
	globe: Globe,
	landmark: Landmark,
};

const getContrastColor = (hex) => {
	if (!hex || !hex.startsWith('#')) return '#ffffff';
	const r = parseInt(hex.substr(1, 2), 16);
	const g = parseInt(hex.substr(3, 2), 16);
	const b = parseInt(hex.substr(5, 2), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? '#000000' : '#ffffff';
};

// --- 3. MAIN RENDERER ---
export const resolveMarkerIcon = (marker) => {
	const {
		shape = 'pin',
		icon = 'default',
		color = '#d97706',
		variant = 'large', // large | small | icon | text
		label,
		labelDisplay = 'hover',
		scale = 1,
	} = marker;

	// --- A. TEXT ONLY ---
	if (variant === 'text') {
		return L.divIcon({
			className: 'custom-text-marker',
			html: `
                <div style="
                    transform: translate(-50%, -50%) scale(var(--label-scale, 1)); 
                    text-align: center;
                    pointer-events: auto;
                    width: max-content;
                ">
                    <span style="
                        font-family: 'Inter', sans-serif;
                        font-weight: 700;
                        font-size: ${16 * scale}px; 
                        color: ${color};
                        text-shadow: 0 0 3px #000, 0 0 5px #000;
                        white-space: nowrap;
                    ">${label || 'Untitled'}</span>
                </div>
            `,
			iconSize: [0, 0],
			iconAnchor: [0, 0],
		});
	}

	// --- B. GRAPHICAL VARIANTS ---
	const ShapeDef = MARKER_SHAPES[shape] || MARKER_SHAPES.pin;
	const iconKey = marker.customIcon || icon || 'default';
	const IconComponent = ICON_MAP[iconKey] || ICON_MAP.default;

	// --- C. RENDER LOGIC ---
	let html = '';
	const finalScale = scale * (variant === 'small' ? 0.6 : 1);
	const width = ShapeDef.width;
	const height = ShapeDef.height;

	// Anchors
	const anchor =
		shape === 'pin' && variant === 'large'
			? [(width * finalScale) / 2, height * finalScale]
			: [(width * finalScale) / 2, (height * finalScale) / 2];

	if (variant === 'icon') {
		// --- ICON ONLY (Sticker Style) ---
		// 1. Black Border (Thick Stroke)
		const bgIconHtml = renderToString(
			React.createElement(IconComponent, {
				size: 26, // Base Size
				strokeWidth: 6, // Thick Black Border (Creates the halo)
				color: '#000000',
				fill: 'none',
				strokeLinejoin: 'round',
				strokeLinecap: 'round',
				style: { position: 'absolute', top: -1, left: -1 },
			})
		);
		// 2. Colored Body (Medium Stroke)
		const fgIconHtml = renderToString(
			React.createElement(IconComponent, {
				size: 24,
				strokeWidth: 3, // Thinner Colored Stroke (Sits inside the black)
				color: color || '#d97706', // Fallback color
				fill: 'none',
				strokeLinejoin: 'round',
				strokeLinecap: 'round',
				style: { position: 'relative', zIndex: 999 },
			})
		);

		html = `
            <div class="marker-icon-only transition-transform hover:scale-110" 
                 style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
                        transform: scale(${scale}); filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">
                ${bgIconHtml}
                ${fgIconHtml}
            </div>
        `;
	} else {
		// --- SHAPE MODE (Pin/Shield/etc) ---
		// Contrast Logic only applies to Shapes
		const contrastColor = getContrastColor(color);

		const innerIconHtml = renderToString(
			React.createElement(IconComponent, {
				size: 14,
				strokeWidth: 2.5,
				color: contrastColor,
				fill: contrastColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
			})
		);

		let svgContent = '';
		if (ShapeDef.type === 'dual') {
			// Pin (User SVG)
			svgContent = `
                <path d="${ShapeDef.path}" fill="white" />
                <path d="${ShapeDef.innerPath}" fill="${color}" />
                <circle cx="16" cy="16" r="10" fill="white" fill-opacity="0.2" style="pointer-events: none;" />
            `;
		} else {
			// Other Shapes (Auto-Border)
			svgContent = `
                <path d="${ShapeDef.path}" fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round" />
            `;
		}

		html = `
            <div class="marker-shape relative group transition-transform hover:-translate-y-1 origin-bottom"
                 style="width: ${width}px; height: ${height}px; transform: scale(${finalScale});">
                
                <svg viewBox="${
									ShapeDef.viewBox
								}" width="100%" height="100%" style="overflow: visible; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">
                    ${svgContent}
                </svg>

                ${
									variant !== 'small'
										? `
                    <div style="
                        position: absolute; 
                        top: ${ShapeDef.iconY}px; 
                        left: 50%; 
                        transform: translate(-50%, -50%); 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        pointer-events: none;
                        width: 16px; 
                        height: 16px;
                    ">
                        ${innerIconHtml}
                    </div>
                `
										: ''
								}
            </div>
        `;
	}

	// --- D. LABEL ---
	if (label && labelDisplay !== 'none') {
		const labelClass =
			labelDisplay === 'hover'
				? 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
				: 'opacity-100';

		const topOffset = shape === 'pin' && variant === 'large' ? '100%' : '60%';

		html += `
            <div class="marker-label absolute left-1/2 -translate-x-1/2 
                        bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded 
                        whitespace-nowrap pointer-events-none transition-all duration-200
                        ${labelClass} backdrop-blur-md shadow-sm z-50 border border-white/10"
                 style="top: ${topOffset}; margin-top: 4px; font-family: 'Inter', sans-serif;">
                ${label}
            </div>
        `;
	}

	return L.divIcon({
		className: 'custom-composite-marker group',
		html: `<div style="transform: scale(var(--label-scale, 1)); transform-origin: center bottom;">${html}</div>`,
		iconSize: [width * finalScale, height * finalScale],
		iconAnchor: anchor,
		popupAnchor: [0, -anchor[1]],
	});
};

export const createLabelIcon = (text, options) => L.divIcon({});
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

// 1. Solid Handle (Existing Points) - White with Black Border
export const createPathHandleIcon = (isSelected) =>
	L.divIcon({
		className: 'path-handle-icon',
		html: `
        <div style="
            width: 12px; 
            height: 12px; 
            background: #ffffff; 
            border: 2px solid ${isSelected ? '#d97706' : '#000000'}; 
            border-radius: 50%; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            transition: transform 0.1s;
        "></div>
    `,
		iconSize: [12, 12],
		iconAnchor: [6, 6],
	});

// 2. Ghost Handle (Midpoints) - Semi-transparent, appears on hover
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
