import { supabase } from '@/shared/api/supabaseClient';

export const globalSearch = async (campaignId, query) => {
	if (!query || query.trim().length === 0) return { sessions: [], entities: [], sessionAttributes: [] };

	const searchTerm = `%${query.trim()}%`;

	// 1. Search Entities
	const { data: entities, error: entitiesError } = await supabase
		.from('entities')
		.select('id, name, type, description')
		.eq('campaign_id', campaignId)
		.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
		.limit(8);

	if (entitiesError) console.error('Entity search error:', entitiesError);

	// 2. Search Sessions
	const { data: sessions, error: sessionsError } = await supabase
		.from('sessions')
		.select('id, title, narrative')
		.eq('campaign_id', campaignId)
		.or(`title.ilike.${searchTerm},narrative.ilike.${searchTerm}`)
		.limit(5);

	if (sessionsError) console.error('Session search error:', sessionsError);

	// 3. Fetch Attributes for Sessions (if any found)
	let sessionAttributes = [];
	if (sessions && sessions.length > 0) {
		const sessionIds = sessions.map((s) => s.id);
		const { data } = await supabase.from('attributes').select('entity_id, name, value').in('entity_id', sessionIds);
		sessionAttributes = data || [];
	}

	return {
		sessions: sessions || [],
		entities: entities || [],
		sessionAttributes,
	};
};
