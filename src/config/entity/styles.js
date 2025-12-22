/**
 * Entity Tailwind Style Builders
 * Generate Tailwind class strings for each entity type
 */

import { ENTITY_TYPES } from './types';

/**
 * Tailwind class maps for each entity type
 */
const ENTITY_TAILWIND_CLASSES = {
	[ENTITY_TYPES.SESSION]: {
		text: 'text-slate-700',
		bg: 'bg-slate-50',
		border: 'border-slate-500',
		hover: 'hover:bg-slate-100',
	},
	[ENTITY_TYPES.CHARACTER]: {
		text: 'text-red-700',
		bg: 'bg-red-50',
		border: 'border-red-500',
		hover: 'hover:bg-red-50',
	},
	[ENTITY_TYPES.NPC]: {
		text: 'text-amber-700',
		bg: 'bg-amber-50',
		border: 'border-amber-500',
		hover: 'hover:bg-amber-50',
	},
	[ENTITY_TYPES.LOCATION]: {
		text: 'text-emerald-700',
		bg: 'bg-emerald-50',
		border: 'border-emerald-500',
		hover: 'hover:bg-emerald-50',
	},
	[ENTITY_TYPES.QUEST]: {
		text: 'text-blue-700',
		bg: 'bg-blue-50',
		border: 'border-blue-500',
		hover: 'hover:bg-blue-50',
	},
	[ENTITY_TYPES.FACTION]: {
		text: 'text-purple-700',
		bg: 'bg-purple-50',
		border: 'border-purple-500',
		hover: 'hover:bg-purple-50',
	},
	[ENTITY_TYPES.ENCOUNTER]: {
		text: 'text-orange-700',
		bg: 'bg-orange-50',
		border: 'border-orange-500',
		hover: 'hover:bg-orange-50',
	},
	[ENTITY_TYPES.DEFAULT]: {
		text: 'text-gray-700',
		bg: 'bg-muted',
		border: 'border-gray-400',
		hover: 'hover:bg-gray-100',
	},
};

/**
 * Get Tailwind classes for entity type
 * @param {string} type - Entity type
 * @returns {Object} Tailwind class object
 */
export const getEntityStyles = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	return ENTITY_TAILWIND_CLASSES[normalized] || ENTITY_TAILWIND_CLASSES[ENTITY_TYPES.DEFAULT];
};

/**
 * Build a complete className string for an entity
 * @param {string} type - Entity type
 * @param {string|string[]} variants - Style variants to include (e.g., 'text', 'bg', 'border')
 * @param {string} additional - Additional classes to append
 * @returns {string} Complete className string
 */
export const buildEntityClassName = (type, variants = [], additional = '') => {
	const styles = getEntityStyles(type);

	// Normalize variants to array
	const variantList = Array.isArray(variants) ? variants : [variants];

	// Build class string
	const classes = variantList
		.map((variant) => styles[variant])
		.filter(Boolean)
		.join(' ');

	return additional ? `${classes} ${additional}` : classes;
};

/**
 * Pre-built utility class sets for common patterns
 */
export const ENTITY_CLASS_PRESETS = {
	/**
	 * Icon badge (small colored circle with icon)
	 */
	iconBadge: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.bg} ${styles.border} ${styles.text} rounded-lg p-2 border`;
	},

	/**
	 * Type badge (uppercase label)
	 */
	typeBadge: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.bg} ${styles.text} ${styles.border} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border`;
	},

	/**
	 * Card container
	 */
	card: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.bg} ${styles.border} border rounded-lg p-4 ${styles.hover} transition-colors`;
	},

	/**
	 * Link styling
	 */
	link: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.text} ${styles.hover} transition-colors font-semibold`;
	},
};

/**
 * Get preset class string
 * @param {string} preset - Preset name
 * @param {string} type - Entity type
 * @returns {string} Complete className string
 */
export const getEntityPreset = (preset, type) => {
	const presetFn = ENTITY_CLASS_PRESETS[preset];
	return presetFn ? presetFn(type) : '';
};
