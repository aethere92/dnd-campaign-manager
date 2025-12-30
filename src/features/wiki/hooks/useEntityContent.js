import { useMemo } from 'react';
import { isSession } from '@/domain/entity/utils/entityUtils';
import { transformEvents } from '@/features/wiki/utils/eventMapper';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import { resolveImageUrl } from '@/shared/utils/imageUtils';

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
		const entityIsEncounter = entity.type === 'encounter';

		// Determine main summary
		let mainSummary = attributes.Summary || entity.summary;
		if (!mainSummary && !entityIsSession) {
			mainSummary = entity.description;
		}

		// --- NEW: TACTICAL MAP RESOLUTION ---
		// We look for common map keys and use resolveImageUrl to handle path cleaning/BaseURL
		const mapImageUrl = resolveImageUrl(attributes, 'any');
		// Note: resolveImageUrl(attributes, 'any') checks background_image, image, icon etc.
		// To be specific to your "crazy idea", let's do a manual check for map-specific keys first:
		const specificMapPath = getAttributeValue(attributes, ['map_image', 'tactical_map', 'map']);
		const finalMapUrl = specificMapPath ? `${import.meta.env.BASE_URL}${specificMapPath.replace(/^\//, '')}` : null;

		// 2. NEW: Resolve Tactical Map Markers
		const rawMarkers = getAttributeValue(attributes, 'map_markers');
		let parsedMarkers = [];
		if (rawMarkers) {
			try {
				// Parse the JSON string stored in the attribute
				parsedMarkers = typeof rawMarkers === 'string' ? JSON.parse(rawMarkers) : rawMarkers;
			} catch (e) {
				console.warn('Failed to parse map_markers JSON', e);
			}
		}

		// Process events
		const events = transformEvents(entity.events);

		// Process Mentions (for Sessions)
		const mentions = entityIsSession ? extractMentions(entity) : null;

		// NEW: Extract Level Up
		const levelUp = getAttributeValue(attributes, ['level_up', 'Level Up', 'levelup']);

		return {
			objectives: entityIsQuest ? entity.objectives || [] : null,
			combatRounds: entityIsEncounter ? entity.combatRounds : null,
			narrative: entityIsSession ? entity.description || '' : null,
			summary: mainSummary || '',
			sections: sections || [],
			history: events,
			mentions,
			levelUp,
			mapImageUrl: finalMapUrl,
			mapMarkers: parsedMarkers,
		};
	}, [entity, attributes, sections]);
};
