import { supabase } from '@/shared/api/supabaseClient';

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
