import { useMemo } from 'react';
import { isSession } from '@/domain/entity/utils/entityUtils';
import { transformEvents } from '@/features/wiki/utils/eventMapper';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
// Removed unused resolveImageUrl import if not used elsewhere,
// or keep if used for other things like parsing attributes (which it is often exported with)
import { resolveImageUrl } from '@/shared/utils/imageUtils';

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

		// Safe JSON Parse for Markers
		const rawMarkers = getAttributeValue(attributes, 'map_markers');
		let parsedMarkers = [];
		if (rawMarkers) {
			if (typeof rawMarkers === 'object') {
				parsedMarkers = rawMarkers;
			} else {
				try {
					parsedMarkers = JSON.parse(rawMarkers);
				} catch (e) {
					console.warn('Map markers parse error', e);
				}
			}
		}

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
			mapMarkers: parsedMarkers,
		};
	}, [entity, attributes, sections]);
};
