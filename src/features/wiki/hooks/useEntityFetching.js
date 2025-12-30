import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getEntities } from '@/domain/entity/api/entityService';

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
		queryFn: async () => {
			// Special Case: For NPCs and Encounters, we need Locations too
			// to build the tree (Region -> City -> Entity)
			if (normalizedType === 'npc' || normalizedType === 'encounter') {
				const [mainEntities, locations] = await Promise.all([
					getEntities(campaignId, normalizedType),
					getEntities(campaignId, 'location'),
				]);
				// Merge them (ensure uniqueness just in case, though types differ)
				return [...mainEntities, ...locations];
			}
			return getEntities(campaignId, normalizedType);
		},
		enabled: !!campaignId && !!normalizedType,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return {
		entities: entities || [],
		isLoading,
		error,
	};
}
