import { supabase } from '../lib/supabase';

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

/**
 * Universal fetch using the View.
 * Returns everything (attributes, relationships) so the UI has full context.
 */
const getCompleteEntities = async (campaignId, type) => {
	const { data, error } = await supabase
		.from('entity_complete_view')
		.select('id, name, type, description, attributes, relationships')
		.eq('campaign_id', campaignId)
		.eq('type', type)
		.order('name');

	if (error) throw error;
	return data;
};

/**
 * Quests need the specific 'status' column from the quests table,
 * merged with attributes from the view (for 'Quest Type').
 */
const getQuestsWithStatus = async (campaignId) => {
	// 1. Fetch Entities from View (for attributes/description)
	const { data: entities, error } = await supabase
		.from('entity_complete_view')
		.select('id, name, type, description, attributes')
		.eq('campaign_id', campaignId)
		.eq('type', 'quest')
		.order('name');

	if (error) throw error;

	// 2. Fetch Status from Quests table (source of truth for status)
	const { data: questStatuses } = await supabase.from('quests').select('id, status');

	const statusMap = new Map((questStatuses || []).map((q) => [q.id, q.status]));

	// 3. Merge
	return entities.map((e) => ({
		...e,
		status: statusMap.get(e.id) || 'active',
	}));
};

/**
 * Strategy map
 */
const entityStrategies = {
	session: getSessions,
	quest: getQuestsWithStatus,
	// Use the View for everything else (NPC, Location, Faction, etc.)
	// This ensures we get Attributes AND Relationships for correct grouping.
	default: getCompleteEntities,
};

export const getEntities = async (campaignId, type) => {
	const strategy = entityStrategies[type] || entityStrategies.default;
	return strategy(campaignId, type);
};

// ... (Rest of file: getGraphData, getEntityIndex, getWikiEntry - keep as is) ...
/**
 * Fetches only the necessary data for the Network Graph.
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

		// FIX: Explicitly sort events by event_order
		const sortedEvents = (data.events || []).sort((a, b) => (a.event_order || 0) - (b.event_order || 0));

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
			events: sortedEvents || [],
		};
	}

	const { data, error } = await supabase.from('entity_complete_view').select('*').eq('id', id).single();

	if (error) throw error;

	// --- FIX: Fetch Quest Specifics (Status + Objectives) ---
	if (type === 'quest') {
		const [statusRes, objectivesRes] = await Promise.all([
			supabase.from('quests').select('status').eq('id', id).single(),
			supabase.from('quest_objectives').select('*').eq('quest_id', id).order('order_index', { ascending: true }),
		]);

		// Merge Status
		if (statusRes.data) {
			data.status = statusRes.data.status;
		}

		// Merge Objectives
		if (objectivesRes.data) {
			data.objectives = objectivesRes.data;
		}
	}

	// Handle events formatting
	let events = data.events;
	if (events && typeof events === 'object' && !Array.isArray(events)) {
		events = Object.values(events).flat();
	}

	if (events && Array.isArray(events) && events.length > 0) {
		const sessionIds = [...new Set(events.map((e) => e.session_id).filter(Boolean))];

		if (sessionIds.length > 0) {
			const { data: sessions, error: sessionsError } = await supabase
				.from('sessions')
				.select('id, session_number')
				.in('id', sessionIds);

			if (!sessionsError && sessions) {
				const sessionMap = new Map(sessions.map((s) => [s.id, s.session_number]));

				events = events.map((event) => ({
					...event,
					session_number:
						event.session_id && sessionMap.has(event.session_id) ? sessionMap.get(event.session_id) - 1 : null,
				}));

				events.sort((a, b) => {
					if (a.session_number !== b.session_number) {
						if (a.session_number == null) return 1;
						if (b.session_number == null) return -1;
						return a.session_number - b.session_number;
					}
					return (a.order || 0) - (b.order || 0);
				});

				data.events = events;
			}
		}
	}

	return data;
};
