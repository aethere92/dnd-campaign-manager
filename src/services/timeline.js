import { supabase } from '../lib/supabase';

export const getTimeline = async (campaignId) => {
	// We use Supabase relational joins to fetch everything in one network request.
	// Syntax: alias:foreign_table_name ( columns )
	const { data, error } = await supabase
		.from('sessions')
		.select(
			`
            id, 
            title, 
            session_number, 
            session_date, 
            summary, 
            narrative,
            events:session_events (
                id, 
                title, 
                description, 
                event_type, 
                event_order,
                npc:npcs ( name ),
                location:locations ( name )
            )
        `
		)
		.eq('campaign_id', campaignId)
		.order('session_number', { ascending: true });

	if (error) throw error;

	// Supabase nested ordering can sometimes be finicky depending on the adapter version,
	// so we perform a lightweight sort on the events array in JavaScript to guarantee order.
	data.forEach((session) => {
		if (session.events && session.events.length > 0) {
			session.events.sort((a, b) => a.event_order - b.event_order);
		}
	});

	return data;
};
