import { supabase } from '../lib/supabase';

export const globalSearch = async (campaignId, query) => {
	if (!query || query.trim().length === 0) return [];

	const searchTerm = `%${query.trim()}%`;

	// Search entities
	const { data: entities, error: entitiesError } = await supabase
		.from('entity_complete_view')
		.select('id, name, type, description, attributes')
		.eq('campaign_id', campaignId)
		.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
		.limit(8);

	if (entitiesError) {
		console.error('Entity search error:', entitiesError);
	}

	// Search sessions
	const { data: sessions, error: sessionsError } = await supabase
		.from('sessions')
		.select('id, title, summary, narrative, session_number, session_date')
		.eq('campaign_id', campaignId)
		.or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},narrative.ilike.${searchTerm}`)
		.limit(5);

	if (sessionsError) {
		console.error('Session search error:', sessionsError);
	}

	// Format sessions to match entity structure
	const sessionResults = (sessions || []).map((s) => ({
		id: s.id,
		name: s.title,
		type: 'session',
		description: s.summary || s.narrative?.substring(0, 150) || '',
		attributes: {
			Session: s.session_number,
			Date: s.session_date,
		},
	}));

	// Combine results
	return [...sessionResults, ...(entities || [])];
};
