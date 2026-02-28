/**
 * Scans narrative text against the entity index and returns mention suggestions.
 * Reuses the same matching logic as the smart-text system.
 */
import { findEntityMatches } from '@/features/smart-text/useSmartText';

/**
 * Scan text and return unique entity mentions not already linked.
 * @param {string} text - Narrative or event description text
 * @param {Array} searchTokens - From useEntityIndex
 * @param {Map} entityMap - From useEntityIndex
 * @param {Set} existingEntityIds - IDs already linked to this session/event
 * @returns {Array<{ entityId, entityName, entityType, snippet }>}
 */
export function scanForMentions(text, searchTokens, entityMap, existingEntityIds = new Set()) {
	if (!text || !searchTokens?.length) return [];

	const matches = findEntityMatches(text, searchTokens, entityMap);
	const seen = new Set();

	return matches
		.filter((m) => {
			if (seen.has(m.entity.id) || existingEntityIds.has(m.entity.id)) return false;
			seen.add(m.entity.id);
			return true;
		})
		.map((m) => {
			// Extract a snippet of surrounding text for context
			const snippetStart = Math.max(0, m.start - 40);
			const snippetEnd = Math.min(text.length, m.end + 40);
			const prefix = snippetStart > 0 ? '...' : '';
			const suffix = snippetEnd < text.length ? '...' : '';
			const snippet = prefix + text.slice(snippetStart, snippetEnd) + suffix;

			return {
				entityId: m.entity.id,
				entityName: m.entity.name,
				entityType: m.entity.type,
				snippet,
			};
		});
}

/**
 * Scan session narrative + all event descriptions, diff against existing relationships.
 * @param {string} narrative - Session narrative text
 * @param {Array} events - Session events with { id, description, relationships }
 * @param {Array} searchTokens - From useEntityIndex
 * @param {Map} entityMap - From useEntityIndex
 * @param {Array} existingSessionRels - Existing session-level relationships
 * @returns {{ sessionMentions: Array, eventMentions: Array<{ eventId, eventTitle, mentions: Array }> }}
 */
export function scanSession(narrative, events, searchTokens, entityMap, existingSessionRels = []) {
	const existingSessionIds = new Set(existingSessionRels.map((r) => r.target?.id || r.to_entity_id));

	const sessionMentions = scanForMentions(narrative, searchTokens, entityMap, existingSessionIds);

	const eventMentions = (events || [])
		.map((evt) => {
			const existingEventIds = new Set((evt.relationships || []).map((r) => r.target?.id));
			const mentions = scanForMentions(evt.description || '', searchTokens, entityMap, existingEventIds);
			return mentions.length > 0 ? { eventId: evt.id, eventTitle: evt.title, mentions } : null;
		})
		.filter(Boolean);

	return { sessionMentions, eventMentions };
}
