import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCampaigns } from '@/features/campaign/api/campaignService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { routes } from '@/app/routes';

export function useCampaignSelection() {
	const { setCampaignId } = useCampaign();
	const navigate = useNavigate(); // 2. Initialize hook

	const { data: campaigns, isLoading } = useQuery({
		queryKey: ['campaigns'],
		queryFn: getCampaigns,
	});

	// Sort by ID
	const sortedCampaigns = (campaigns || []).sort((a, b) => String(a.campaign_id).localeCompare(String(b.campaign_id)));

	const selectCampaign = (campaignId) => {
		setCampaignId(campaignId);
		// Navigate straight to the campaign's own URL rather than to bare '/'.
		// Going via '/' would bounce through CampaignRedirect and depend on the
		// setState above having landed first — a race. This is unambiguous.
		navigate(routes.campaign.root(campaignId));
	};

	return {
		isLoading,
		campaigns: sortedCampaigns,
		selectCampaign,
	};
}
