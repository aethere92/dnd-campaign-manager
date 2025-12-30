import { supabase } from '@/shared/api/supabaseClient';

// Moved getWikiEntry here to reduce bloat in entities.js
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

	// FETCH QUEST OBJECTIVES
	if (type === 'quest') {
		const { data: objectives } = await supabase
			.from('quest_objectives')
			.select('*, session:sessions(id, title)')
			.eq('quest_id', id)
			.order('order_index', { ascending: true });

		if (objectives && objectives.length > 0) {
			const sessionIds = objectives.map((o) => o.completed_session_id).filter(Boolean);
			if (sessionIds.length > 0) {
				const { data: attrs } = await supabase
					.from('attributes')
					.select('entity_id, value')
					.in('entity_id', sessionIds)
					.or('name.eq.session_number,name.eq.Session');

				const sessionNumMap = new Map();
				(attrs || []).forEach((a) => sessionNumMap.set(a.entity_id, a.value));

				objectives.forEach((obj) => {
					if (obj.session) {
						obj.session.session_number = sessionNumMap.get(obj.session.id);
					}
				});
			}
		}
		additional.objectives = objectives || [];
	}

	// FETCH ENCOUNTER ACTIONS
	if (type === 'encounter') {
		const { data: actions } = await supabase
			.from('encounter_actions')
			.select(`*, actor:entities!actor_entity_id (id, name, type), target:entities!target_entity_id (id, name, type)`)
			.eq('encounter_id', id)
			.order('round_number', { ascending: true })
			.order('action_order', { ascending: true });

		if (actions && actions.length > 0) {
			const entityIds = new Set();
			actions.forEach((a) => {
				if (a.actor?.id) entityIds.add(a.actor.id);
				if (a.target?.id) entityIds.add(a.target.id);
			});

			if (entityIds.size > 0) {
				const { data: attrs } = await supabase
					.from('attributes')
					.select('entity_id, name, value')
					.in('entity_id', Array.from(entityIds));

				const attrMap = new Map();
				(attrs || []).forEach((attr) => {
					if (!attrMap.has(attr.entity_id)) attrMap.set(attr.entity_id, []);
					attrMap.get(attr.entity_id).push(attr);
				});

				actions.forEach((action) => {
					if (action.actor?.id) action.actor.attributes = attrMap.get(action.actor.id) || [];
					if (action.target?.id) action.target.attributes = attrMap.get(action.target.id) || [];
				});
			}
		}
		additional.encounterActions = actions || [];
	}

	// RESOLVE SESSION NUMBERS FOR EVENTS
	let events = data.events;
	// Flatten logic
	if (events && typeof events === 'object' && !Array.isArray(events)) events = Object.values(events).flat();

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
