/**
 * Relationship Transform Functions
 * Pure functions for processing entity relationships into view model format
 */

import { getEntityConfig } from '@/domain/entity/config/entityConfig';

/**
 * Parse relationships from various formats
 * @param {string|Array|Object} relationships - Raw relationships data
 * @returns {Array}
 */
export const parseRelationships = (relationships) => {
	if (!relationships) return [];

	// Already an array
	if (Array.isArray(relationships)) {
		return relationships;
	}

	// String (JSON)
	if (typeof relationships === 'string') {
		try {
			return JSON.parse(relationships);
		} catch {
			return [];
		}
	}

	// Object (convert to array)
	if (typeof relationships === 'object') {
		return Object.values(relationships);
	}

	return [];
};

/**
 * Transform relationships into connection view models
 * @param {Array} relationships - Parsed relationships
 * @param {number} maxConnections - Maximum connections to show (default 8)
 * @returns {Array}
 */
export const transformRelationships = (relationships, maxConnections = 8) => {
	const parsed = parseRelationships(relationships);

	return parsed
		.map((rel) => {
			const config = getEntityConfig(rel.entity_type);

			return {
				id: rel.entity_id || Math.random().toString(),
				name: rel.entity_name,
				typeLabel: rel.entity_type,
				role: formatRelationshipType(rel.type),
				theme: {
					...config.tailwind,
					Icon: config.icon,
				},
			};
		})
		.slice(0, maxConnections);
};

/**
 * Format relationship type for display
 * @param {string} type - Raw relationship type
 * @returns {string}
 */
const formatRelationshipType = (type) => {
	if (!type) return 'related';
	return type.toLowerCase().replace(/_/g, ' ');
};
