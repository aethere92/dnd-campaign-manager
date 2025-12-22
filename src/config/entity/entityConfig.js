/**
 * Entity Configuration Orchestrator
 * Combines all entity config modules into a unified API
 * This replaces the old monolithic entityConfig.jsx
 */

import { ENTITY_TYPES, getEntityLabel } from './types';
import { getEntityIcon } from './icons';
import { getEntityColor, getEntityPalette } from './colors';
import { getEntityStyles, getEntityPreset, buildEntityClassName } from './styles';

/**
 * Get complete configuration for an entity type
 * @param {string} type - Entity type
 * @returns {Object} Complete entity config
 */
export const getEntityConfig = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;

	return {
		type: normalized,
		label: getEntityLabel(normalized),
		labelPlural: getEntityLabel(normalized, true),
		icon: getEntityIcon(normalized),
		color: getEntityColor(normalized),
		palette: getEntityPalette(normalized),
		tailwind: getEntityStyles(normalized),
	};
};

/**
 * LEGACY EXPORT: Full config map for backwards compatibility
 * TODO: Gradually migrate consumers to use getEntityConfig() instead
 */
export const ENTITY_CONFIG = Object.values(ENTITY_TYPES).reduce((acc, type) => {
	acc[type] = getEntityConfig(type);
	return acc;
}, {});

// Re-export everything for convenience
export { ENTITY_TYPES, getEntityLabel } from './types';
export { getEntityIcon } from './icons';
export { getEntityColor, getEntityPalette } from './colors';
export { getEntityStyles, getEntityPreset, buildEntityClassName } from './styles';
