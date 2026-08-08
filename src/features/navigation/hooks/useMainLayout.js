import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '@/features/campaign/api/campaignService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { NAV_STRUCTURE } from '@/features/navigation/config/navConfig';
import { routes } from '@/app/routes';

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

	// Memoised so consumers (and the effect below) get a stable object. Rebuilding
	// it every render meant every consumer saw a "changed" campaign each time.
	const campaign = useMemo(
		() =>
			currentCampaignData
				? {
						name: currentCampaignData.name || 'Campaign',
						initial: (currentCampaignData.name?.[0] || 'C').toUpperCase(),
					}
				: null,
		[currentCampaignData]
	);

	// --- Dynamic Document Title ---
	// Depends on the name string rather than the `campaign` object: the title only
	// cares about the name, so this no longer re-runs when an unrelated field of the
	// campaign record changes.
	const campaignName = campaign?.name;
	useEffect(() => {
		if (campaignName) {
			document.title = `${campaignName} | Campaign Manager`;
		}
		// Reset when unmounting (leaving campaign view)
		return () => {
			document.title = 'D&D Campaign Manager';
		};
	}, [campaignName]);
	// -----------------------------------

	const navStructure = useMemo(() => {
		const hasMapData = !!currentCampaignData?.attributes?.map_data;
		const base = campaignId != null ? routes.campaign.root(campaignId) : '';

		return NAV_STRUCTURE.map((group) => ({
			...group,
			items: group.items
				.filter((item) => (item.key === 'atlas' ? hasMapData : true))
				// navConfig stores campaign-relative paths ('/', '/atlas', '/wiki/npc');
				// prefix them with the current campaign scope here so the config stays
				// free of campaign ids. '/' maps to the campaign root, not '<base>/'.
				.map((item) => ({
					...item,
					path: item.path === '/' ? base || '/' : `${base}${item.path}`,
					// Items with sub-routes stay highlighted while on any of them, so they
					// match by prefix; the rest match exactly. Wiki sections have detail
					// pages (/wiki/npc/:id) and atlas has a per-map route (/atlas/:mapId),
					// so both need prefix matching or the nav button never lights up on the
					// page it links to. Derived from the original unscoped path.
					matchByPrefix: item.path.startsWith('/wiki/') || item.path === '/atlas',
				})),
		})).filter((group) => group.items.length > 0);
	}, [currentCampaignData, campaignId]);

	const navigateTo = (path) => {
		navigate(path);
		setSidebarOpen(false);
	};

	const onSwitchCampaign = () => {
		setCampaignId(null);
		// Go to the picker. The old code navigated to '/wiki/session', which only
		// happened to land on selection because that route didn't exist without a
		// campaign; now that campaigns are scoped it would be a 404.
		navigate(routes.selectCampaign());
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
