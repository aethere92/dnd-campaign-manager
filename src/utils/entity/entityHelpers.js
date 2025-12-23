/**
 * Entity Type Utilities
 * Pure functions for entity type checking and normalization
 */

/**
 * Normalize entity type string
 * @param {string} type - Raw type string
 * @returns {string} Normalized type
 */
export const normalizeEntityType = (type) => {
	if (!type) return 'default';
	const normalized = type.toLowerCase().trim();
	// Handle plurals
	return normalized === 'sessions' ? 'session' : normalized;
};

/**
 * Check if entity type is a specific value
 * @param {Object} entity - Entity object
 * @param {string} type - Type to check
 * @returns {boolean}
 */
export const isEntityType = (entity, type) => {
	return normalizeEntityType(entity?.type) === normalizeEntityType(type);
};

/**
 * Check if entity is a session
 */
export const isSession = (entity) => isEntityType(entity, 'session');

/**
 * Check if entity is a quest
 */
export const isQuest = (entity) => isEntityType(entity, 'quest');

/**
 * Check if entity is an NPC
 */
export const isNPC = (entity) => isEntityType(entity, 'npc');

/**
 * Check if entity is a location
 */
export const isLocation = (entity) => isEntityType(entity, 'location');

/**
 * Check if entity type should show status icons
 * @param {string} type - Entity type
 * @returns {boolean}
 */
export const shouldShowStatus = (type) => {
	const normalized = normalizeEntityType(type);
	return ['npc', 'faction', 'quest'].includes(normalized);
};

/**
 * Get entity display name
 * Handles different name fields across entity types
 * @param {Object} entity - Entity object
 * @returns {string}
 */
export const getEntityName = (entity) => {
	if (!entity) return 'Unknown';

	// Sessions use 'title'
	if (isSession(entity)) {
		return entity.title || entity.name || 'Untitled Session';
	}

	// Quests use 'title'
	if (isQuest(entity)) {
		return entity.title || entity.name || 'Untitled Quest';
	}

	// Everyone else uses 'name'
	return entity.name || 'Unnamed';
};

/**
 * Get entity description
 * Handles different description fields
 * @param {Object} entity - Entity object
 * @returns {string|null}
 */
export const getEntityDescription = (entity) => {
	if (!entity) return null;

	// Try description first
	if (entity.description) return entity.description;

	// Sessions might use summary
	if (isSession(entity)) {
		return entity?.summary || entity.narrative || null;
	}

	// Characters might use background
	if (isEntityType(entity, 'character')) {
		return entity.background || entity.short_description || null;
	}

	return null;
};

/**
 * Get entity icon initial (first letter)
 * @param {Object} entity - Entity object
 * @returns {string}
 */
export const getEntityInitial = (entity) => {
	const name = getEntityName(entity);
	return (name[0] || 'E').toUpperCase();
};

/**
 * Check if entity is marked as dead/inactive
 * @param {Object} entity - Entity object
 * @returns {boolean}
 */
export const isEntityDead = (entity) => {
	const status = entity.status?.toLowerCase();
	return status === 'dead' || status === 'deceased' || status === 'inactive';
};

/**
 * Check if entity/quest is completed
 * @param {Object} entity - Entity object
 * @returns {boolean}
 */
export const isEntityCompleted = (entity) => {
	const status = entity.status?.toLowerCase();
	return ['completed', 'finished', 'done', 'success'].some((k) => status?.includes(k));
};

/**
 * Check if entity/quest has failed
 * @param {Object} entity - Entity object
 * @returns {boolean}
 */
export const isEntityFailed = (entity) => {
	const status = entity.status?.toLowerCase();
	return ['failed', 'failure', 'abandoned'].some((k) => status?.includes(k));
};
