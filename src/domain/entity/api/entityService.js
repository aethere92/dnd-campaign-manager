import { supabase } from '@/shared/api/supabaseClient';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import { getCampaigns } from '@/features/campaign/api/campaignService';

// --- HELPER: Extract Session Meta ---
const extractSessionMeta = (session, attributes = []) => {
	let attrs = attributes;
	if (Array.isArray(attrs)) {
		attrs = attrs.reduce((acc, curr) => {
			acc[curr.name] = curr.value;
			return acc;
		}, {});
	}
	attrs = attrs || {};

	const sessionNumber = getAttributeValue(attrs, ['session_number', 'Session', 'session']) || 999;
	const sessionDate = getAttributeValue(attrs, ['session_date', 'Date', 'date']) || '';

	return {
		...session,
		session_number: Number(sessionNumber),
		session_date: sessionDate,
		attributes: attrs,
	};
};

// --- API METHODS ---

export const getSessions = async (campaignId) => {
	const { data: sessions, error } = await supabase
		.from('sessions')
		.select('id, title, narrative')
		.eq('campaign_id', campaignId);

	if (error) throw error;
	if (!sessions.length) return [];

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

	const processed = sessions.map((s) => {
		const sAttrs = attrMap.get(s.id) || [];
		const meta = extractSessionMeta(s, sAttrs);

		return {
			id: meta.id,
			name: meta.title,
			type: 'session',
			session_number: meta.session_number,
			session_date: meta.session_date,
			summary: getAttributeValue(meta.attributes, 'Summary') || meta.narrative,
			narrative: meta.narrative,
			attributes: meta.attributes,
		};
	});

	return processed.sort((a, b) => a.session_number - b.session_number);
};

// Generic fetcher
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

const entityStrategies = {
	session: getSessions,
	quest: getCompleteEntities,
	default: getCompleteEntities,
	campaign: async () => getCampaigns(),
};

export const getEntities = async (campaignId, type) => {
	const strategy = entityStrategies[type] || entityStrategies.default;
	return strategy(campaignId, type);
};

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

export const getEntityIndex = async (campaignId) => {
	const { data, error } = await supabase
		.from('entity_complete_view')
		.select('id, name, type, attributes, relationships, description')
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

		const { data: attributes } = await supabase.from('attributes').select('name, value').eq('entity_id', id);

		const eventIds = (data.events || []).map((e) => e.id);
		let eventRelMap = new Map();

		if (eventIds.length > 0) {
			const { data: rels } = await supabase
				.from('entity_relationships')
				.select(`from_entity_id, target:entities!to_entity_id ( id, name, type )`)
				.in('from_entity_id', eventIds);

			(rels || []).forEach((rel) => {
				if (!eventRelMap.has(rel.from_entity_id)) eventRelMap.set(rel.from_entity_id, []);
				eventRelMap.get(rel.from_entity_id).push({
					entity_id: rel.target.id,
					entity_name: rel.target.name,
					entity_type: rel.target.type,
					type: 'mention',
				});
			});
		}

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

		return {
			data,
			type: 'session',
			additional: { attributes, eventRelMap, sessionRelationships },
		};
	}

	// --- STANDARD ENTITY FETCH ---
	const { data, error: entityError } = await supabase.from('entity_complete_view').select('*').eq('id', id).single();
	if (entityError) throw entityError;

	const additional = {};

	// FETCH QUEST OBJECTIVES WITH SESSION DATA
	if (type === 'quest') {
		const { data: objectives, error: objError } = await supabase
			.from('quest_objectives')
			.select('*, session:sessions(id, title)') // Basic join for title
			.eq('quest_id', id)
			.order('order_index', { ascending: true });

		if (objError) console.error('Error fetching objectives:', objError);

		if (objectives && objectives.length > 0) {
			// 2. Fetch Session Numbers (stored as attributes)
			const sessionIds = objectives.map((o) => o.completed_session_id).filter(Boolean);

			if (sessionIds.length > 0) {
				const { data: attrs } = await supabase
					.from('attributes')
					.select('entity_id, value')
					.in('entity_id', sessionIds)
					.or('name.eq.session_number,name.eq.Session');

				const sessionNumMap = new Map();
				(attrs || []).forEach((a) => sessionNumMap.set(a.entity_id, a.value));

				// 3. Attach number to the session object inside the objective
				objectives.forEach((obj) => {
					if (obj.session) {
						obj.session.session_number = sessionNumMap.get(obj.session.id);
					}
				});
			}
		}

		additional.objectives = objectives || [];
	}

	// 2. ENCOUNTER ACTIONS (UPDATED)
	if (type === 'encounter') {
		// Step A: Fetch Actions with basic Actor/Target info
		const { data: actions, error: actError } = await supabase
			.from('encounter_actions')
			.select(
				`
                *,
                actor:entities!actor_entity_id (id, name, type),
                target:entities!target_entity_id (id, name, type)
            `
			)
			.eq('encounter_id', id)
			.order('round_number', { ascending: true })
			.order('action_order', { ascending: true });

		if (actError) console.error('Error fetching encounter actions:', actError);

		if (actions && actions.length > 0) {
			// Step B: Get ALL unique Entity IDs (Actors AND Targets)
			const entityIds = new Set();
			actions.forEach((a) => {
				if (a.actor?.id) entityIds.add(a.actor.id);
				if (a.target?.id) entityIds.add(a.target.id);
			});

			// Step C: Fetch attributes for these entities
			let entityAttrs = [];
			if (entityIds.size > 0) {
				const { data: attrs } = await supabase
					.from('attributes')
					.select('entity_id, name, value')
					.in('entity_id', Array.from(entityIds));
				entityAttrs = attrs || [];
			}

			// Step D: Map attributes
			const attrMap = new Map();
			entityAttrs.forEach((attr) => {
				if (!attrMap.has(attr.entity_id)) attrMap.set(attr.entity_id, []);
				attrMap.get(attr.entity_id).push(attr);
			});

			// Step E: Attach to action objects
			actions.forEach((action) => {
				if (action.actor?.id) {
					action.actor.attributes = attrMap.get(action.actor.id) || [];
				}
				if (action.target?.id) {
					action.target.attributes = attrMap.get(action.target.id) || [];
				}
			});
		}

		additional.encounterActions = actions || [];
	}

	// RESOLVE SESSION NUMBERS FOR EVENTS
	let events = data.events;
	if (events && typeof events === 'object' && !Array.isArray(events)) {
		events = Object.values(events).flat();
	}

	if (events && Array.isArray(events) && events.length > 0) {
		const sessionIds = [...new Set(events.map((e) => e.session_id).filter(Boolean))];
		if (sessionIds.length > 0) {
			const { data: sessions } = await supabase.from('sessions').select('id').in('id', sessionIds);

			const { data: attrs } = await supabase
				.from('attributes')
				.select('entity_id, name, value')
				.in('entity_id', sessionIds)
				.or('name.eq.session_number,name.eq.Session');

			const sessionMap = new Map();
			(sessions || []).forEach((s) => {
				const sAttr = (attrs || []).find((a) => a.entity_id === s.id);
				const num = sAttr ? parseInt(sAttr.value) : null;
				sessionMap.set(s.id, num);
			});

			additional.sessionMap = sessionMap;
		}
	}

	return { data, type, additional };
};

export const getTooltipData = async (id, type) => {
	if (type === 'session') {
		const { data } = await supabase.from('sessions').select('title, narrative').eq('id', id).single();
		const { data: attributes } = await supabase.from('attributes').select('name, value').eq('entity_id', id);
		return {
			name: data.title,
			type: 'session',
			description: data.narrative,
			attributes,
		};
	}

	const { data, error } = await supabase
		.from('entity_complete_view')
		.select('name, type, description, attributes')
		.eq('id', id)
		.single();
	if (error) throw error;
	return data;
};
