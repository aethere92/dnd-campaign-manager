import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGraphData } from '@/features/graph/api/graphService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { transformGraphData } from './utils/graphMapper'; // Import transform
// import './types';

export function useGraphViewModel() {
	const { campaignId } = useCampaign();

	const { data: rawEntities, isLoading } = useQuery({
		queryKey: ['graph', campaignId],
		queryFn: () => getGraphData(campaignId),
		enabled: !!campaignId,
	});

	// Use the pure transform function
	const elements = useMemo(() => {
		return transformGraphData(rawEntities);
	}, [rawEntities]);

	return { elements, isLoading };
}
