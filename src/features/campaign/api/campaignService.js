import { supabase } from '@/shared/api/supabaseClient';

export const getCampaigns = async () => {
	// We fetch campaigns and use a subquery to get names of entities with type 'character'
	// ARCHITECTURAL UPDATE: Added 'map_data' to check if Atlas should be enabled
	const { data, error } = await supabase
		.from('campaigns')
		.select(
			`
            id,
			campaign_id,
            name, 
            description,
			attributes,
            characters:entity_complete_view(name)
        `
		)
		.eq('entity_complete_view.type', 'character');

	if (error) throw error;

	// Clean up the nested character structure
	return data.map((campaign) => ({
		...campaign,
		characterNames: campaign.characters?.map((c) => c.name) || [],
	}));
};
