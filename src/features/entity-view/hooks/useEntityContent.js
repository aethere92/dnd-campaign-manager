/**
 * useEntityContent Hook
 * Builds content view model from entity data
 */

import { useMemo } from 'react';
import { isSession } from '../../../utils/entity/entityHelpers';
import { transformEvents } from '../transforms/eventTransform';

/**
 * Build content view model
 * @param {Object} entity - Raw entity data
 * @param {Object} attributes - Parsed attributes
 * @param {Array} sections - Narrative sections from attribute transform
 * @returns {Object} Content view model
 */
export const useEntityContent = (entity, attributes, sections) => {
	return useMemo(() => {
		if (!entity) return null;

		const entityIsSession = isSession(entity);
		const entityIsQuest = entity.type === 'quest';

		// Determine main summary
		let mainSummary = attributes.Summary || entity.summary;
		if (!mainSummary && !entityIsSession) {
			mainSummary = entity.description;
		}

		// Process events
		const events = transformEvents(entity.events);

		return {
			// Quest-specific
			objectives: entityIsQuest ? entity.objectives || [] : null,

			// Session-specific
			narrative: entityIsSession ? entity.description || '' : null,

			// Standard
			summary: mainSummary || '',
			sections: sections || [],
			history: events,
		};
	}, [entity, attributes, sections]);
};
