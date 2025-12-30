import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCampaigns } from '@/features/campaign/api/campaignService';
import { useCampaign } from './CampaignContext';
// import './types';

export function useCampaignSelection() {
	const { setCampaignId } = useCampaign();
	const navigate = useNavigate(); // 2. Initialize hook

	const { data: campaigns, isLoading } = useQuery({
		queryKey: ['campaigns'],
		queryFn: getCampaigns,
	});

	// Sort by ID
	const sortedCampaigns = (campaigns || []).sort((a, b) => String(a.campaign_id).localeCompare(String(b.campaign_id)));

	const selectCampaign = (id) => {
		setCampaignId(id);
		navigate('/'); // 3. Force navigation to the main app route
	};

	return {
		isLoading,
		campaigns: sortedCampaigns,
		selectCampaign,
	};
}
