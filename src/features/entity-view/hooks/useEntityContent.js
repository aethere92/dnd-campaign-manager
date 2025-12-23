import { useMemo } from 'react';
import { isSession } from '../../../utils/entity/entityHelpers';
import { transformEvents } from '../transforms/eventTransform';

/**
 * Helper: Extract and group mentioned entities from events and direct relationships
 */
const extractMentions = (entity) => {
	const mentionsMap = new Map();

	// 1. Gather from direct relationships
	if (entity.relationships) {
		entity.relationships.forEach((rel) => {
			if (!rel.entity_id) return;
			mentionsMap.set(rel.entity_id, {
				id: rel.entity_id,
				name: rel.entity_name,
				type: rel.entity_type,
			});
		});
	}

	// 2. Gather from Events (tags)
	if (entity.events) {
		entity.events.forEach((evt) => {
			if (evt.relationships) {
				evt.relationships.forEach((rel) => {
					if (!rel.entity_id) return;
					mentionsMap.set(rel.entity_id, {
						id: rel.entity_id,
						name: rel.entity_name,
						type: rel.entity_type,
					});
				});
			}
		});
	}

	// 3. Group by Type
	const groups = {
		character: [],
		npc: [],
		location: [],
		faction: [],
		quest: [],
		encounter: [],
		other: [],
	};

	mentionsMap.forEach((item) => {
		const type = item.type?.toLowerCase() || 'other';
		if (groups[type]) {
			groups[type].push(item);
		} else {
			groups.other.push(item);
		}
	});

	// 4. Sort each group alphabetically
	Object.keys(groups).forEach((key) => {
		groups[key].sort((a, b) => a.name.localeCompare(b.name));
	});

	// 5. Remove empty groups
	Object.keys(groups).forEach((key) => {
		if (groups[key].length === 0) delete groups[key];
	});

	return groups;
};

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

		// NEW: Process Mentions (for Sessions)
		const mentions = entityIsSession ? extractMentions(entity) : null;

		return {
			objectives: entityIsQuest ? entity.objectives || [] : null,
			narrative: entityIsSession ? entity.description || '' : null,
			summary: mainSummary || '',
			sections: sections || [],
			history: events,
			mentions, // Exported to View Model
		};
	}, [entity, attributes, sections]);
};
