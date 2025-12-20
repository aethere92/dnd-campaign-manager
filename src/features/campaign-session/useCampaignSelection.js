import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../../services/campaigns';
import { useCampaign } from './CampaignContext';
import './types';

export function useCampaignSelection() {
	const { setCampaignId } = useCampaign();

	const { data: campaigns, isLoading } = useQuery({
		queryKey: ['campaigns'],
		queryFn: getCampaigns,
	});

	// Sort by ID as requested
	const sortedCampaigns = (campaigns || []).sort((a, b) => String(a.campaign_id).localeCompare(String(b.campaign_id)));

	const selectCampaign = (id) => {
		setCampaignId(id);
	};

	return {
		isLoading,
		campaigns: sortedCampaigns,
		selectCampaign,
	};
}
