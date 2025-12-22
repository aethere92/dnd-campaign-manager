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
			// Invalidate stale data instead of removing (preserves in-flight requests)
			queryClient.invalidateQueries({
				predicate: (query) => {
					const key = query.queryKey[0];
					// Only invalidate campaign-specific data
					return ['entities', 'entry', 'timeline', 'graph', 'entityIndex', 'globalSearch'].includes(key);
				},
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
