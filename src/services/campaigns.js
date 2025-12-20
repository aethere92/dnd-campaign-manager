import { supabase } from '../lib/supabase';

export const getCampaigns = async () => {
	// We fetch campaigns and use a subquery to get names of entities with type 'character'
	const { data, error } = await supabase
		.from('campaigns')
		.select(
			`
            id,
			campaign_id,
            name, 
            description,
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
