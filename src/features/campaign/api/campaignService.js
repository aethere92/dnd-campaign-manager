import { supabase } from '@/shared/api/supabaseClient';

export const getCampaigns = async () => {
	/**
	 * OPTIMIZATION:
	 * Instead of fetching all entities and filtering in JS or via multiple query params,
	 * we join 'view_active_party'. This SQL view already filters for:
	 * (attributes->>'is_active')::boolean = true
	 */
	const { data, error } = await supabase.from('campaigns').select(`
            id,
            campaign_id,
            name, 
            description,
            attributes,
            active_characters:view_active_party(name)
        `);

	if (error) {
		console.error('[campaignService] Error fetching campaigns:', error);
		throw error;
	}

	// Clean up the nested structure
	return data.map((campaign) => ({
		...campaign,
		// Map the view results to the characterNames array used by the UI
		characterNames: campaign.active_characters?.map((c) => c.name) || [],
	}));
};
