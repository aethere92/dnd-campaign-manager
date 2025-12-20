import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// FIX: Import from the specific service file
import { getCampaigns } from '../../services/campaigns';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { NAV_STRUCTURE } from './navConfig';
import './types';

export function useMainLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { campaignId, setCampaignId } = useCampaign();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const { data: campaigns } = useQuery({
		queryKey: ['campaigns'],
		queryFn: getCampaigns,
		staleTime: 1000 * 60 * 10,
	});

	const currentCampaignData = campaigns?.find((c) => c.id === campaignId);

	const campaign = currentCampaignData
		? {
				name: currentCampaignData.name || 'Campaign',
				initial: (currentCampaignData.name?.[0] || 'C').toUpperCase(),
		  }
		: null;

	const navigateTo = (path) => {
		navigate(path);
		setSidebarOpen(false);
	};

	const onSwitchCampaign = () => {
		setCampaignId(null);
		navigate('/wiki/session');
	};

	return {
		sidebarOpen,
		setSidebarOpen,
		currentPath: location.pathname,
		navigateTo,
		campaign,
		onSwitchCampaign,
		navStructure: NAV_STRUCTURE,
	};
}
