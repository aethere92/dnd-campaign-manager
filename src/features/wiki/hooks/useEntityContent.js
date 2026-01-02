// features/wiki/hooks/useEntityContent.js
import { useMemo } from 'react';
import { isSession } from '@/domain/entity/utils/entityUtils';
import { transformEvents } from '@/features/wiki/utils/eventMapper';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
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

		// Resolve Map Image
		const mapImageUrl = resolveImageUrl(attributes, 'any');
		const specificMapPath = getAttributeValue(attributes, ['map_image', 'tactical_map', 'map']);
		const finalMapUrl = specificMapPath
			? `${import.meta.env.BASE_URL}${specificMapPath.replace(/^\//, '')}`
			: mapImageUrl; // Fallback to generic image if no specific map

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
						// Simple grouping logic moved inline or keep helper if complex
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
