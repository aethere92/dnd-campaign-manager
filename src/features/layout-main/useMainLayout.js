import { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

	// --- NEW: Dynamic Document Title ---
	useEffect(() => {
		if (campaign?.name) {
			document.title = `${campaign.name} | Campaign Manager`;
		}
		// Reset when unmounting (leaving campaign view)
		return () => {
			document.title = 'D&D Campaign Manager';
		};
	}, [campaign]);
	// -----------------------------------

	const navStructure = useMemo(() => {
		const hasMapData = !!currentCampaignData?.map_data;

		return NAV_STRUCTURE.map((group) => ({
			...group,
			items: group.items.filter((item) => {
				if (item.key === 'atlas') {
					return hasMapData;
				}
				return true;
			}),
		})).filter((group) => group.items.length > 0);
	}, [currentCampaignData]);

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
		navStructure,
	};
}
