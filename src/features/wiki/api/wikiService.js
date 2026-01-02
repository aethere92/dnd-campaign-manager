// features/wiki/api/wikiService.js
import { supabase } from '@/shared/api/supabaseClient';

export const getWikiEntry = async (id, type) => {
	// STRATEGY: Session
	// Uses view_campaign_timeline to get the session + aggregated events + relationship tags
	if (type === 'session') {
		const { data: timelineData, error } = await supabase
			.from('view_campaign_timeline')
			.select('*')
			.eq('session_id', id)
			.single();

		if (error) throw error;

		// Fetch direct (non-event) relationships for the "Mentions" tab
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

		// Transform Tags (from View) into EventRelMap format for the Mapper
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
				events: timelineData.events,
				attributes: {
					...timelineData.attributes,
					session_number: timelineData.session_number,
					session_date: timelineData.session_date,
				},
			},
			type: 'session',
			additional: { eventRelMap, sessionRelationships },
		};
	}

	// STRATEGY: Standard Entity (Core Data)
	// Uses the optimized entity_complete_view (JSONB source)
	const { data, error } = await supabase.from('entity_complete_view').select('*').eq('id', id).single();

	if (error) throw error;

	const additional = {};

	// STRATEGY: Quest Objectives
	// Single query with nested session attributes
	if (type === 'quest') {
		const { data: objectives } = await supabase
			.from('quest_objectives')
			.select(
				`
                *,
                session:sessions ( id, title, attributes )
            `
			)
			.eq('quest_id', id)
			.order('order_index', { ascending: true });

		additional.objectives = objectives || [];
	}

	// STRATEGY: Encounter Actions
	// Uses the hydrated view to avoid N+1 attribute lookups
	if (type === 'encounter') {
		const { data: actions } = await supabase
			.from('view_encounter_actions_hydrated')
			.select('*')
			.eq('encounter_id', id)
			.order('round_number', { ascending: true })
			.order('action_order', { ascending: true });

		additional.encounterActions = actions || [];
	}

	// STRATEGY: Event Session Resolution
	// (Only needed if the entity has historical events)
	// We optimize this by fetching only the needed session attributes
	if (data.events && Object.keys(data.events).length > 0) {
		const flatEvents = Object.values(data.events).flat();
		const sessionIds = [...new Set(flatEvents.map((e) => e.session_id).filter(Boolean))];

		if (sessionIds.length > 0) {
			const { data: sessions } = await supabase.from('sessions').select('id, attributes').in('id', sessionIds);

			const sessionMap = new Map();
			(sessions || []).forEach((s) => {
				// Access JSONB column directly
				const num = s.attributes?.session_number || s.attributes?.session;
				sessionMap.set(s.id, num ? Number(num) : null);
			});
			additional.sessionMap = sessionMap;
		}
	}

	return { data, type, additional };
};
