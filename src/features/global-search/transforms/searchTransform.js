import { getAttributeValue } from '../../../utils/entity/attributeParser';

export const transformSearchResults = (rawResults) => {
	const { sessions, entities, sessionAttributes } = rawResults;

	// 1. Process Sessions
	const attrMap = new Map();
	(sessionAttributes || []).forEach((attr) => {
		if (!attrMap.has(attr.entity_id)) attrMap.set(attr.entity_id, []);
		attrMap.get(attr.entity_id).push(attr);
	});

	const processedSessions = sessions.map((s) => {
		const rawAttrs = attrMap.get(s.id) || [];
		const attrs = rawAttrs.reduce((acc, c) => ({ ...acc, [c.name]: c.value }), {});

		const num = getAttributeValue(attrs, ['session_number', 'Session']);
		const date = getAttributeValue(attrs, ['session_date', 'Date']);
		const summaryAttr = getAttributeValue(attrs, 'Summary');

		return {
			id: s.id,
			name: s.title,
			type: 'session',
			// Prefer Summary attribute, fallback to snippet of narrative
			description: summaryAttr || s.narrative?.substring(0, 150) || '',
			attributes: {
				Session: num,
				Date: date,
			},
		};
	});

	// 2. Combine with standard entities
	return [...processedSessions, ...(entities || [])];
};
