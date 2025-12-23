import { supabase } from '../lib/supabase';
import { getAttributeValue } from '../utils/entity/attributeParser';

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
	// 1. Fetch Sessions (No summary, No join)
	const { data: sessions, error } = await supabase
		.from('sessions')
		.select('id, title, narrative')
		.eq('campaign_id', campaignId);

	if (error) throw error;
	if (!sessions.length) return [];

	// 2. Fetch Attributes Separately
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
		.select('id, name, type, attributes')
		.eq('campaign_id', campaignId);

	if (error) return [];
	return data.sort((a, b) => b.name.length - a.name.length);
};

export const getWikiEntry = async (id, type) => {
	if (type === 'session') {
		// 1. Fetch Session
		const { data, error } = await supabase
			.from('sessions')
			.select(`*, events:session_events (*)`)
			.eq('id', id)
			.single();

		if (error) throw error;

		// 2. Fetch Attributes Separately
		const { data: attributes } = await supabase.from('attributes').select('name, value').eq('entity_id', id);

		const meta = extractSessionMeta(data, attributes || []);
		const sortedEvents = (data.events || []).sort((a, b) => (a.event_order || 0) - (b.event_order || 0));

		// 3. Fetch Event Tags (Relationships linked to events)
		const eventIds = sortedEvents.map((e) => e.id);
		let eventRelationships = [];

		if (eventIds.length > 0) {
			const { data: rels } = await supabase
				.from('entity_relationships')
				.select(`from_entity_id, target:entities!to_entity_id ( id, name, type )`)
				.in('from_entity_id', eventIds);

			if (rels) eventRelationships = rels;
		}

		// Attach relationships to events
		const relMap = new Map();
		eventRelationships.forEach((rel) => {
			if (!relMap.has(rel.from_entity_id)) relMap.set(rel.from_entity_id, []);
			relMap.get(rel.from_entity_id).push({
				entity_id: rel.target.id,
				entity_name: rel.target.name,
				entity_type: rel.target.type,
				type: 'mention',
			});
		});

		sortedEvents.forEach((evt) => {
			evt.relationships = relMap.get(evt.id) || [];
		});

		// 4. NEW: Fetch Direct Session Relationships (Session -> Entity)
		const { data: directRels } = await supabase
			.from('entity_relationships')
			.select(`target:entities!to_entity_id ( id, name, type ), relationship_type`)
			.eq('from_entity_id', id);

		const sessionRelationships = (directRels || []).map((rel) => ({
			entity_id: rel.target.id,
			entity_name: rel.target.name,
			entity_type: rel.target.type,
			type: rel.relationship_type, // e.g. "visited", "discussed"
		}));

		return {
			id: data.id,
			name: data.title,
			type: 'session',
			description: getAttributeValue(meta.attributes, 'Summary') || data.narrative,
			attributes: {
				...meta.attributes,
				Session: meta.session_number,
				Date: meta.session_date,
			},
			relationships: sessionRelationships, // Now populated with direct links
			events: sortedEvents || [],
		};
	}

	// --- STANDARD ENTITY FETCH ---
	const { data, error: entityError } = await supabase.from('entity_complete_view').select('*').eq('id', id).single();
	if (entityError) throw entityError;

	// Quest Specifics
	if (type === 'quest') {
		const { data: objectives } = await supabase
			.from('quest_objectives')
			.select('*')
			.eq('quest_id', id)
			.order('order_index', { ascending: true });
		if (objectives) data.objectives = objectives;
	}

	// Event Processing
	let events = data.events;
	if (events && typeof events === 'object' && !Array.isArray(events)) {
		events = Object.values(events).flat();
	}

	if (events && Array.isArray(events) && events.length > 0) {
		const sessionIds = [...new Set(events.map((e) => e.session_id).filter(Boolean))];
		if (sessionIds.length > 0) {
			const { data: sessions, error: sessionsError } = await supabase
				.from('sessions')
				.select('id')
				.in('id', sessionIds);

			if (!sessionsError && sessions && sessions.length > 0) {
				const { data: attrs } = await supabase
					.from('attributes')
					.select('entity_id, name, value')
					.in(
						'entity_id',
						sessions.map((s) => s.id)
					);

				const attrMap = new Map();
				(attrs || []).forEach((a) => {
					if (!attrMap.has(a.entity_id)) attrMap.set(a.entity_id, []);
					attrMap.get(a.entity_id).push(a);
				});

				const sessionMap = new Map();
				sessions.forEach((s) => {
					const sAttrs = attrMap.get(s.id) || [];
					const meta = extractSessionMeta(s, sAttrs);
					sessionMap.set(s.id, meta.session_number);
				});

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
