import { supabase } from '@/shared/api/supabaseClient';

export const getTimeline = async (campaignId) => {
	// The view handles all aggregation, casting, and ordering efficiently.
	const { data, error } = await supabase
		.from('view_campaign_timeline')
		.select('*')
		.eq('campaign_id', campaignId)
		.order('session_number', { ascending: true }); // Postgres handles the casting/sorting

	if (error) throw error;
	return data || [];
};
