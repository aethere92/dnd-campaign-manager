import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TooltipProvider } from '@/features/smart-tooltip/TooltipContext';
import { CampaignProvider, useCampaign } from '@/features/campaign/CampaignContext';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import { AppRoutes } from './AppRoutes';

function AppContent() {
	const { campaignId } = useCampaign();
	const queryClient = useQueryClient();

	// 1. Set global texture
	useEffect(() => {
		const texturePath = `${import.meta.env.BASE_URL}images/background_texture.webp`;
		document.documentElement.style.setProperty('--bg-texture', `url('${texturePath}')`);
	}, []);

	// 2. Set Default App Title
	useEffect(() => {
		document.title = 'D&D Campaign Manager';
	}, []);

	// 3. Clear cache when campaign changes
	useEffect(() => {
		if (campaignId) {
			queryClient.invalidateQueries({
				predicate: (query) => {
					const key = query.queryKey[0];
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
				<AppContent />
			</CampaignProvider>
		</ErrorBoundary>
	);
}
