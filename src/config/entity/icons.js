/**
 * Entity Icon Mapping
 * Lucide icons for each entity type
 */

import { User, MapPin, Scroll, Sword, Flag, Crown, BookOpen, Calendar } from 'lucide-react';

import { ENTITY_TYPES } from './types';

/**
 * Icon map for entity types
 */
export const ENTITY_ICONS = {
	[ENTITY_TYPES.SESSION]: Calendar,
	[ENTITY_TYPES.CHARACTER]: User,
	[ENTITY_TYPES.NPC]: Crown,
	[ENTITY_TYPES.LOCATION]: MapPin,
	[ENTITY_TYPES.QUEST]: Scroll,
	[ENTITY_TYPES.FACTION]: Flag,
	[ENTITY_TYPES.ENCOUNTER]: Sword,
	[ENTITY_TYPES.DEFAULT]: BookOpen,
};

/**
 * Get icon component for entity type
 * @param {string} type - Entity type
 * @returns {React.Component} Lucide icon component
 */
export const getEntityIcon = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	return ENTITY_ICONS[normalized] || ENTITY_ICONS[ENTITY_TYPES.DEFAULT];
};
