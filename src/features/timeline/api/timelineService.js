import { supabase } from '@/shared/api/supabaseClient';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

export const getTimeline = async (campaignId) => {
	// 1. Fetch Sessions (No summary)
	const { data: sessions, error: sessionError } = await supabase
		.from('sessions')
		.select(
			`
            id, 
            title, 
            narrative,
            events:session_events (
                id, 
                title, 
                description, 
                event_type, 
                event_order
            )
        `
		)
		.eq('campaign_id', campaignId);

	if (sessionError) throw sessionError;
	if (!sessions || sessions.length === 0) return [];

	// 2. Fetch Attributes
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

	// 3. Process
	const processedSessions = sessions
		.map((s) => {
			const rawAttrs = attrMap.get(s.id) || [];
			const attrs = rawAttrs.reduce((acc, c) => {
				acc[c.name] = c.value;
				return acc;
			}, {});

			const num = getAttributeValue(attrs, ['session_number', 'Session']) || 999;
			const date = getAttributeValue(attrs, ['session_date', 'Date']) || 'Unknown Date';

			return {
				...s,
				session_number: Number(num),
				session_date: date,
				attributes: attrs,
				events: s.events || [],
			};
		})
		.sort((a, b) => a.session_number - b.session_number);

	// ... Steps 4, 5, 6 (Tags logic) remain exactly the same ...
	// (Included for completeness)
	const allEvents = processedSessions.flatMap((s) => s.events);
	const eventIds = allEvents.map((e) => e.id);

	if (eventIds.length === 0) return processedSessions;

	const { data: relationships, error: relError } = await supabase
		.from('entity_relationships')
		.select(`from_entity_id, target:entities!to_entity_id ( name, type )`)
		.in('from_entity_id', eventIds);

	if (relError) return processedSessions;

	const relMap = new Map();
	relationships.forEach((rel) => {
		if (!relMap.has(rel.from_entity_id)) relMap.set(rel.from_entity_id, []);
		relMap.get(rel.from_entity_id).push(rel);
	});

	processedSessions.forEach((session) => {
		if (session.events.length > 0) {
			session.events.sort((a, b) => (a.event_order || 0) - (b.event_order || 0));
			session.events.forEach((event) => {
				event.relationships = relMap.get(event.id) || [];
			});
		}
	});

	return processedSessions;
};
