import { supabase } from '@/shared/api/supabaseClient';
import { getCampaigns } from '@/features/campaign/api/campaignService';

// --- API METHODS ---

export const getSessions = async (campaignId) => {
	// OPTIMIZATION: Use the pre-aggregated view
	const { data, error } = await supabase
		.from('view_campaign_timeline')
		.select('*')
		.eq('campaign_id', campaignId)
		.order('session_number', { ascending: true });

	if (error) throw error;

	// Map View structure to Domain structure
	return (data || []).map((s) => ({
		id: s.session_id,
		name: s.session_title,
		type: 'session',
		session_number: s.session_number,
		session_date: s.session_date,
		narrative: s.session_narrative,
		// Ensure generic attributes object exists for compatibility
		attributes: {
			session_number: s.session_number,
			session_date: s.session_date,
		},
	}));
};

const getCompleteEntities = async (campaignId, type) => {
	// Uses the detailed view for full entity pages
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
 * Fetch Narrative Arcs and their links to Sessions
 * Used for organizing the Wiki Swimlanes
 */
export const getCampaignArcs = async (campaignId) => {
	// 1. Fetch the Pre-Calculated View
	const { data: arcs, error: arcError } = await supabase
		.from('view_narrative_arc_summary')
		.select('*')
		.eq('campaign_id', campaignId) // Ensure your view handles campaign_id or filter via join if needed
		.order('order', { ascending: true });

	if (arcError) throw arcError;

	// 2. Fetch the Session Links (needed for grouping logic in JS)
	const { data: rels, error: relError } = await supabase
		.from('entity_relationships')
		.select('from_entity_id, to_entity_id')
		.eq('relationship_type', 'part_of')
		.in(
			'to_entity_id',
			arcs.map((a) => a.id)
		); // Only get links for these arcs

	if (relError) throw relError;

	return { arcs, rels };
};

export const getEntities = async (campaignId, type) => {
	const strategy = entityStrategies[type] || entityStrategies.default;
	return strategy(campaignId, type);
};

export const getGraphData = async (campaignId) => {
	// OPTIMIZATION: Use the graph-specific view (Nodes + Adjacency List)
	const { data, error } = await supabase.from('view_campaign_graph').select('*').eq('campaign_id', campaignId);

	if (error) {
		console.error('Graph Fetch Error:', error);
		return [];
	}
	return data || [];
};

export const getEntityIndex = async (campaignId) => {
	// OPTIMIZATION: Use lightweight index view (No heavy JSON joins)
	const { data, error } = await supabase
		.from('view_entity_index')
		.select('*') // Selects: id, name, type, description, icon_url, status, affinity
		.eq('campaign_id', campaignId);

	if (error) return [];

	// Remap flat columns to expected 'attributes' object for UI compatibility
	return data
		.map((e) => ({
			...e,
			attributes: {
				icon: e.icon_url,
				status: e.status,
				affinity: e.affinity,
				background_image: e.background_image,
				aliases: e.aliases,
			},
		}))
		.sort((a, b) => b.name.length - a.name.length);
};

// --- WIKI ENTRY STRATEGIES ---

const fetchSessionWikiEntry = async (id) => {
	// 1. Fetch Core Data + Events + Mentions via View
	// The view_campaign_timeline has everything we need for the session structure
	const { data: timelineData, error } = await supabase
		.from('view_campaign_timeline')
		.select('*')
		.eq('session_id', id)
		.single();

	if (error) throw error;

	// 2. Fetch Direct Session Relationships (not event-tied)
	// We still need the generic relationships for the sidebar
	const { data: directRels } = await supabase
		.from('entity_relationships')
		.select(`target:entities!to_entity_id ( id, name, type ), relationship_type`)
		.eq('from_entity_id', id);

	const sessionRelationships = (directRels || []).map((rel) => ({
		entity_id: rel.target.id,
		entity_name: rel.target.name,
		entity_type: rel.target.type,
		type: rel.relationship_type,
	}));

	// 3. Transform Event Tags to Mention Map
	// The view returns events with 'tags'. We need to flatten this for the UI.
	const eventRelMap = new Map();
	(timelineData.events || []).forEach((event) => {
		if (event.tags && event.tags.length > 0) {
			eventRelMap.set(
				event.id,
				event.tags.map((tag) => ({
					entity_id: tag.entity_id,
					entity_name: tag.name,
					entity_type: tag.type,
					type: 'mention',
				}))
			);
		}
	});

	return {
		data: {
			id: timelineData.session_id,
			title: timelineData.session_title,
			narrative: timelineData.session_narrative,
			events: timelineData.events, // Pre-sorted and aggregated
			attributes: {
				session_number: timelineData.session_number,
				session_date: timelineData.session_date,
			},
		},
		type: 'session',
		additional: { eventRelMap, sessionRelationships },
	};
};

const fetchEncounterWikiEntry = async (id, entityData) => {
	// OPTIMIZATION: Use the Hydrated View
	const { data: actions, error } = await supabase
		.from('view_encounter_actions_hydrated')
		.select('*')
		.eq('encounter_id', id)
		.order('round_number', { ascending: true })
		.order('action_order', { ascending: true });

	if (error) console.error('Encounter Actions Fetch Error:', error);

	return {
		data: entityData,
		type: 'encounter',
		additional: { encounterActions: actions || [] },
	};
};

const fetchQuestWikiEntry = async (id, entityData) => {
	// OPTIMIZATION: Single query with nested select for Session Attributes
	const { data: objectives, error } = await supabase
		.from('quest_objectives')
		.select(
			`
            *,
            session:sessions (
                id, 
                title,
                attributes
            )
        `
		)
		.eq('quest_id', id)
		.order('order_index', { ascending: true });

	if (error) console.error('Quest Objectives Error:', error);

	// Client-side cleanup: Extract session_number from JSONB
	const processedObjectives = (objectives || []).map((obj) => {
		if (obj.session) {
			const attrs = obj.session.attributes || {};
			obj.session.session_number = attrs.session_number || attrs.session;
		}
		return obj;
	});

	return {
		data: entityData,
		type: 'quest',
		additional: { objectives: processedObjectives },
	};
};

// Main Entry Point
export const getWikiEntry = async (id, type) => {
	// Strategy: Session is unique because it comes from a different base table/view
	if (type === 'session') {
		return fetchSessionWikiEntry(id);
	}

	// Standard Entities: Fetch Core Data first
	const { data, error } = await supabase.from('entity_complete_view').select('*').eq('id', id).single();
	if (error) throw error;

	// Strategy Pattern for Additional Data
	if (type === 'encounter') return fetchEncounterWikiEntry(id, data);
	if (type === 'quest') return fetchQuestWikiEntry(id, data);

	// Default
	return { data, type, additional: {} };
};

export const getTooltipData = async (id, type) => {
	if (type === 'session') {
		const { data } = await supabase.from('sessions').select('title, narrative').eq('id', id).single();
		return {
			name: data.title,
			type: 'session',
			description: data.narrative,
			attributes: {},
		};
	}

	// Lightweight fetch for tooltip
	const { data, error } = await supabase
		.from('entity_complete_view') // Could optimize to view_entity_index if attributes aren't needed
		.select('name, type, description, attributes')
		.eq('id', id)
		.single();

	if (error) throw error;
	return data;
};

const entityStrategies = {
	session: getSessions,
	quest: getCompleteEntities,
	default: getCompleteEntities,
	campaign: async () => getCampaigns(),
};
