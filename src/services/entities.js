import { supabase } from '../lib/supabase';

/**
 * Fetches a list of entities for a specific type (e.g., all 'npcs').
 * Used by: WikiSidebar, MapView
 */
/**
 * Fetches sessions separately since they're not in entity_complete_view
 */
export const getSessions = async (campaignId) => {
	const { data, error } = await supabase
		.from('sessions')
		.select('id, title, session_number, session_date, summary')
		.eq('campaign_id', campaignId)
		.order('session_number', { ascending: true });

	if (error) throw error;

	// Transform to match entity structure
	return data.map((session) => ({
		id: session.id,
		name: session.title,
		type: 'session',
		...session,
	}));
};

// UPDATE getEntities to handle sessions
export const getEntities = async (campaignId, type) => {
	// Special case for sessions
	if (type === 'session') {
		return getSessions(campaignId);
	}

	const { data, error } = await supabase
		.from('entity_complete_view')
		.select('*')
		.eq('campaign_id', campaignId)
		.eq('type', type);

	if (error) throw error;
	return data;
};

/**
 * Fetches only the necessary data for the Network Graph.
 * Used by: RelationshipGraph
 */
export const getGraphData = async (campaignId) => {
	const { data, error } = await supabase
		.from('entity_complete_view')
		.select('id, name, type, relationships, attributes')
		.eq('campaign_id', campaignId);

	if (error) {
		console.error('Graph Fetch Error:', error);
		return [];
	}
	return data || [];
};

/**
 * Fetches a lightweight list of names/IDs for auto-linking text.
 * Used by: SmartMarkdown (via useEntityIndex)
 */
export const getEntityIndex = async (campaignId) => {
	const { data, error } = await supabase
		.from('entity_complete_view')
		// Fetch attributes to parse icons
		.select('id, name, type, attributes')
		.eq('campaign_id', campaignId);

	if (error) return [];
	return data.sort((a, b) => b.name.length - a.name.length);
};

export const getWikiEntry = async (id, type) => {
	if (type === 'session') {
		const { data, error } = await supabase
			.from('sessions')
			.select(`*, events:session_events (*)`)
			.eq('id', id)
			.single();

		if (error) throw error;

		return {
			id: data.id,
			name: data.title,
			type: 'session',
			description: data.narrative || data.summary,
			attributes: {
				Session: data.session_number,
				Date: data.session_date,
				Summary: data.summary,
			},
			relationships: [],
			events: data.events || [],
		};
	}

	const { data, error } = await supabase.from('entity_complete_view').select('*').eq('id', id).single();

	if (error) throw error;

	// Handle events that come as grouped object or array
	let events = data.events;

	// If events is an object grouped by type, flatten it
	if (events && typeof events === 'object' && !Array.isArray(events)) {
		events = Object.values(events).flat();
	}

	// If this entity has events, enrich them with session information
	if (events && Array.isArray(events) && events.length > 0) {
		// Get unique session IDs from events
		const sessionIds = [...new Set(events.map((e) => e.session_id).filter(Boolean))];

		if (sessionIds.length > 0) {
			// Fetch session numbers for these session IDs
			const { data: sessions, error: sessionsError } = await supabase
				.from('sessions')
				.select('id, session_number')
				.in('id', sessionIds);

			if (!sessionsError && sessions) {
				// Create a lookup map: session_id -> session_number
				const sessionMap = new Map(sessions.map((s) => [s.id, s.session_number]));

				// Enrich events with session numbers (subtract 1 for display)
				events = events.map((event) => ({
					...event,
					session_number:
						event.session_id && sessionMap.has(event.session_id) ? sessionMap.get(event.session_id) - 1 : null,
				}));

				// Sort events by session number (ascending), then by order
				events.sort((a, b) => {
					// First sort by session_number
					if (a.session_number !== b.session_number) {
						// Handle nulls - put them at the end
						if (a.session_number == null) return 1;
						if (b.session_number == null) return -1;
						return a.session_number - b.session_number;
					}
					// Then sort by order within same session
					return (a.order || 0) - (b.order || 0);
				});

				// Update the data object with enriched and sorted events
				data.events = events;
			}
		}
	}

	return data;
};
