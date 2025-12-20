import { supabase } from '../lib/supabase';

export const getTimeline = async (campaignId) => {
	const { data, error } = await supabase
		.from('sessions')
		.select(
			`
			id, title, session_number, session_date, summary, narrative,
			events:session_events (
				id, title, description, event_type, event_order,
				npc_id,
				location_id
			)
		`
		)
		.eq('campaign_id', campaignId)
		.order('session_number', { ascending: true });

	if (error) throw error;

	// Then fetch related entities separately if needed
	const eventsWithRelations = await Promise.all(
		(data || []).map(async (session) => {
			const events = await Promise.all(
				(session.events || []).map(async (event) => {
					let npc = null;
					let location = null;

					if (event.npc_id) {
						const { data: npcData } = await supabase
							.from('entity_complete_view')
							.select('name')
							.eq('id', event.npc_id)
							.single();
						npc = npcData;
					}

					if (event.location_id) {
						const { data: locData } = await supabase
							.from('entity_complete_view')
							.select('name')
							.eq('id', event.location_id)
							.single();
						location = locData;
					}

					return { ...event, npc, location };
				})
			);

			return { ...session, events };
		})
	);

	return eventsWithRelations;
};
