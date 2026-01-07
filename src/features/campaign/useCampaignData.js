import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabaseClient';
import { CAMPAIGN_REGISTRY } from '@/features/atlas/utils/mapNavigation';

export function useCampaignData(campaignId) {
	const [campaignRow, setCampaignRow] = useState(null);
	const [campaignData, setCampaignData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		// If no ID is selected, reset everything
		if (!campaignId) {
			setCampaignRow(null);
			setCampaignData(null);
			return;
		}

		const fetchCampaign = async () => {
			setIsLoading(true);
			try {
				// 1. Fetch the specific campaign row
				const { data, error } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();

				if (error) throw error;

				setCampaignRow(data);

				// 2. Resolve the Map Config Object
				// The DB attribute "map_data" holds the string key (e.g. "campaign_002_map_data")
				const mapDataKey = data?.attributes?.map_data;

				if (mapDataKey && CAMPAIGN_REGISTRY[mapDataKey]) {
					setCampaignData(CAMPAIGN_REGISTRY[mapDataKey]);
				} else {
					console.warn(`[useCampaignData] Registry key not found or empty: ${mapDataKey}`);
					setCampaignData(null);
				}
			} catch (err) {
				console.error('[useCampaignData] Error loading campaign:', err);
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCampaign();
	}, [campaignId]);

	return { campaignRow, campaignData, isLoading, error };
}
