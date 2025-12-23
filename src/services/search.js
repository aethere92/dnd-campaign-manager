import { supabase } from '../lib/supabase';
import { getAttributeValue } from '../utils/entity/attributeParser';

export const globalSearch = async (campaignId, query) => {
	if (!query || query.trim().length === 0) return [];

	const searchTerm = `%${query.trim()}%`;

	// 1. Search Entities
	const { data: entities, error: entitiesError } = await supabase
		.from('entities')
		.select('id, name, type, description')
		.eq('campaign_id', campaignId)
		.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
		.limit(8);

	if (entitiesError) console.error('Entity search error:', entitiesError);

	// 2. Search Sessions (No summary)
	// We only search title and narrative now
	const { data: sessions, error: sessionsError } = await supabase
		.from('sessions')
		.select('id, title, narrative')
		.eq('campaign_id', campaignId)
		.or(`title.ilike.${searchTerm},narrative.ilike.${searchTerm}`)
		.limit(5);

	if (sessionsError) console.error('Session search error:', sessionsError);

	let sessionResults = [];

	if (sessions && sessions.length > 0) {
		const sessionIds = sessions.map((s) => s.id);
		const { data: attributes } = await supabase
			.from('attributes')
			.select('entity_id, name, value')
			.in('entity_id', sessionIds);

		const attrMap = new Map();
		(attributes || []).forEach((attr) => {
			if (!attrMap.has(attr.entity_id)) attrMap.set(attr.entity_id, []);
			attrMap.get(attr.entity_id).push(attr);
		});

		sessionResults = sessions.map((s) => {
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
	}

	return [...sessionResults, ...(entities || [])];
};
