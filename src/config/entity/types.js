/**
 * Entity Type Definitions
 * Central source of truth for entity types
 */

/**
 * All valid entity types in the system
 */
export const ENTITY_TYPES = {
	SESSION: 'session',
	CHARACTER: 'character',
	NPC: 'npc',
	LOCATION: 'location',
	QUEST: 'quest',
	FACTION: 'faction',
	ENCOUNTER: 'encounter',
	DEFAULT: 'default',
};

/**
 * Entity type labels (for display)
 */
export const ENTITY_LABELS = {
	[ENTITY_TYPES.SESSION]: 'Session',
	[ENTITY_TYPES.CHARACTER]: 'Character',
	[ENTITY_TYPES.NPC]: 'NPC',
	[ENTITY_TYPES.LOCATION]: 'Location',
	[ENTITY_TYPES.QUEST]: 'Quest',
	[ENTITY_TYPES.FACTION]: 'Faction',
	[ENTITY_TYPES.ENCOUNTER]: 'Encounter',
	[ENTITY_TYPES.DEFAULT]: 'Entity',
};

/**
 * Pluralized entity labels (for navigation, headers)
 */
export const ENTITY_LABELS_PLURAL = {
	[ENTITY_TYPES.SESSION]: 'Sessions',
	[ENTITY_TYPES.CHARACTER]: 'Characters',
	[ENTITY_TYPES.NPC]: 'NPCs',
	[ENTITY_TYPES.LOCATION]: 'Locations',
	[ENTITY_TYPES.QUEST]: 'Quests',
	[ENTITY_TYPES.FACTION]: 'Factions',
	[ENTITY_TYPES.ENCOUNTER]: 'Encounters',
	[ENTITY_TYPES.DEFAULT]: 'Entities',
};

/**
 * Get label for entity type
 * @param {string} type - Entity type
 * @param {boolean} plural - Return plural form
 * @returns {string}
 */
export const getEntityLabel = (type, plural = false) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	const labels = plural ? ENTITY_LABELS_PLURAL : ENTITY_LABELS;
	return labels[normalized] || labels[ENTITY_TYPES.DEFAULT];
};
