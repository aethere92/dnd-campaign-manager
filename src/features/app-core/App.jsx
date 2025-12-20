// features/app-core/App.jsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // Add this
import { TooltipProvider } from '../../features/smart-tooltip/TooltipContext';
import { CampaignProvider, useCampaign } from '../../features/campaign-session/CampaignContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { AppRoutes } from './AppRoutes';

function AppContent() {
	const { campaignId } = useCampaign();
	const queryClient = useQueryClient();

	// 1. Set global texture
	useEffect(() => {
		const texturePath = `${import.meta.env.BASE_URL}images/background_texture.png`;
		document.documentElement.style.setProperty('--bg-texture', `url('${texturePath}')`);
	}, []);

	// 2. CRITICAL FIX: Clear cache when campaign changes
	useEffect(() => {
		if (campaignId) {
			// Remove all queries except the 'campaigns' list itself
			queryClient.removeQueries({
				predicate: (query) => query.queryKey[0] !== 'campaigns',
			});
		}
	}, [campaignId, queryClient]);

	return (
		<TooltipProvider>
			<AppRoutes />
		</TooltipProvider>
	);
}

export default function App() {
	return (
		<ErrorBoundary>
			<CampaignProvider>
				{/* We move logic to a sub-component so we can use useCampaign() */}
				<AppContent />
			</CampaignProvider>
		</ErrorBoundary>
	);
}
