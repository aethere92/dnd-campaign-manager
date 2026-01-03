import { useMemo } from 'react';
import { isSession } from '@/domain/entity/utils/entityUtils';
import { transformEvents } from '@/features/wiki/utils/eventMapper';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

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

		// --- MAP RESOLUTION FIX ---
		// 1. Look ONLY for specific map keys. Do not fallback to 'icon' or 'background'.
		const specificMapPath = getAttributeValue(attributes, ['map_image', 'tactical_map', 'map']);

		// 2. Construct URL if path exists
		const finalMapUrl = specificMapPath ? `${import.meta.env.BASE_URL}${specificMapPath.replace(/^\//, '')}` : null;

		// Transform Events
		const events = transformEvents(entity.events);

		// Extract Mentions (Sessions only)
		const mentions =
			entityIsSession && entity.relationships
				? entity.relationships.reduce((acc, rel) => {
						const type = rel.entity_type?.toLowerCase() || 'other';
						if (!acc[type]) acc[type] = [];
						acc[type].push({
							id: rel.entity_id,
							name: rel.entity_name,
							type: rel.entity_type,
						});
						return acc;
				  }, {})
				: null;

		const levelUp = getAttributeValue(attributes, ['level_up', 'Level Up']);

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
			mapMarkers: attributes?.map_markers,
		};
	}, [entity, attributes, sections]);
};
