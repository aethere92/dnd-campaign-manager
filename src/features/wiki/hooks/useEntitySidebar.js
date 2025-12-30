/**
 * useEntitySidebar Hook
 * Builds sidebar view model from entity data
 */

import { useMemo } from 'react';
import { transformRelationships } from '@/features/wiki/utils/relationshipMapper';

/**
 * Build sidebar view model
 * @param {Object} entity - Raw entity data
 * @param {Array} traits - Traits from attribute transform
 * @returns {Object} Sidebar view model
 */
export const useEntitySidebar = (entity, traits) => {
	return useMemo(() => {
		if (!entity) return null;

		const connections = transformRelationships(entity.relationships, 50);

		return {
			traits: traits || [],
			connections,
		};
	}, [entity, traits]);
};
