/**
 * Entity Configuration Module
 * Centralized export for all entity-related config
 */

// Main API
export { getEntityConfig, ENTITY_CONFIG } from './entityConfig';

// Types
export { ENTITY_TYPES, ENTITY_LABELS, ENTITY_LABELS_PLURAL, getEntityLabel } from './types';

// Icons
export { ENTITY_ICONS, getEntityIcon } from './icons';

// Colors
export { ENTITY_COLORS, ENTITY_COLOR_PALETTES, getEntityColor, getEntityPalette } from './colors';

// Styles
export { getEntityStyles, getEntityPreset, buildEntityClassName, ENTITY_CLASS_PRESETS } from './styles';
