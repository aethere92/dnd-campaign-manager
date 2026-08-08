import { supabase } from '@/shared/api/supabaseClient';
import { getCampaigns } from '@/features/campaign/api/campaignService';

// --- API METHODS ---

export const getSessions = async (campaignId) => {
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

export const getEntityIndex = async (campaignId) => {
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

const getMaps = async (campaignId) => {
	const { data, error } = await supabase
		.from('maps')
		.select('id, title, key, config')
		.eq('campaign_id', campaignId)
		.order('title');

	if (error) throw error;

	// Map DB structure to Domain Entity structure for the UI
	return (data || []).map((m) => ({
		id: m.id,
		name: m.title, // UI expects 'name'
		type: 'map',
		description: m.key, // Use the key/slug as the description line
		attributes: m.config || {}, // Expose config (width, height, path) as attributes
	}));
};

const entityStrategies = {
	session: getSessions,
	quest: getCompleteEntities,
	map: getMaps,
	default: getCompleteEntities,
	campaign: async () => getCampaigns(),
};
