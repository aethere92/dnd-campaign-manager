/**
 * Entity Color Palettes
 * Hex colors for each entity type
 */

import { ENTITY_TYPES } from './entityTypes';

/**
 * Primary color for each entity type (hex)
 */
export const ENTITY_COLORS = {
	[ENTITY_TYPES.SESSION]: '#64748b', // slate-500
	[ENTITY_TYPES.CHARACTER]: '#ef4444', // red-500
	[ENTITY_TYPES.NPC]: '#d97706', // amber-600
	[ENTITY_TYPES.LOCATION]: '#10b981', // emerald-500
	[ENTITY_TYPES.QUEST]: '#3b82f6', // blue-500
	[ENTITY_TYPES.FACTION]: '#a855f7', // purple-500
	[ENTITY_TYPES.ENCOUNTER]: '#f97316', // orange-500
	[ENTITY_TYPES.ITEM]: '#06b6d4', // cyan-500
	[ENTITY_TYPES.DEFAULT]: '#6b7280', // gray-500
};

/**
 * Get primary color for entity type
 * @param {string} type - Entity type
 * @returns {string} Hex color
 */
export const getEntityColor = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	return ENTITY_COLORS[normalized] || ENTITY_COLORS[ENTITY_TYPES.DEFAULT];
};

/**
 * Extended color palette for each type (for future use)
 * Includes lighter/darker shades
 */
export const ENTITY_COLOR_PALETTES = {
	[ENTITY_TYPES.SESSION]: {
		50: '#f8fafc',
		100: '#f1f5f9',
		500: '#64748b',
		700: '#334155',
		900: '#0f172a',
	},
	[ENTITY_TYPES.CHARACTER]: {
		50: '#fef2f2',
		100: '#fee2e2',
		500: '#ef4444',
		700: '#b91c1c',
		900: '#7f1d1d',
	},
	[ENTITY_TYPES.NPC]: {
		50: '#fffbeb',
		100: '#fef3c7',
		500: '#d97706',
		700: '#a16207',
		900: '#78350f',
	},
	[ENTITY_TYPES.LOCATION]: {
		50: '#ecfdf5',
		100: '#d1fae5',
		500: '#10b981',
		700: '#047857',
		900: '#064e3b',
	},
	[ENTITY_TYPES.QUEST]: {
		50: '#eff6ff',
		100: '#dbeafe',
		500: '#3b82f6',
		700: '#1d4ed8',
		900: '#1e3a8a',
	},
	[ENTITY_TYPES.FACTION]: {
		50: '#faf5ff',
		100: '#f3e8ff',
		500: '#a855f7',
		700: '#7e22ce',
		900: '#581c87',
	},
	[ENTITY_TYPES.ENCOUNTER]: {
		50: '#fff7ed',
		100: '#ffedd5',
		500: '#f97316',
		700: '#c2410c',
		900: '#7c2d12',
	},
	[ENTITY_TYPES.ITEM]: {
		// <--- ADDED
		50: '#ecfeff',
		100: '#cffafe',
		500: '#06b6d4',
		700: '#0e7490',
		900: '#164e63',
	},
	[ENTITY_TYPES.DEFAULT]: {
		50: '#f9fafb',
		100: '#f3f4f6',
		500: '#6b7280',
		700: '#374151',
		900: '#111827',
	},
};

/**
 * Get color palette for entity type
 * @param {string} type - Entity type
 * @returns {Object} Color palette
 */
export const getEntityPalette = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	return ENTITY_COLOR_PALETTES[normalized] || ENTITY_COLOR_PALETTES[ENTITY_TYPES.DEFAULT];
};
