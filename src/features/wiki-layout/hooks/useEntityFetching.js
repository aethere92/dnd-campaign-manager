import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '../../campaign-session/CampaignContext';
import { getEntities } from '../../../services/entities';

/**
 * Fetches entity data for a given type
 * Handles query invalidation and error states
 */
export function useEntityFetching(type) {
	const { campaignId } = useCampaign();
	const normalizedType = type === 'sessions' ? 'session' : type;

	const {
		data: entities,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['entities', campaignId, normalizedType],
		queryFn: () => getEntities(campaignId, normalizedType),
		enabled: !!campaignId && !!normalizedType,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return {
		entities: entities || [],
		isLoading,
		error,
	};
}
