import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getEntities } from '@/domain/entity/api/entityService';
import { useMemo } from 'react';

export function useEntityFetching(type) {
	const { campaignId } = useCampaign();
	const normalizedType = type === 'sessions' ? 'session' : type;

	// 1. Primary Query (The requested type)
	const mainQuery = useQuery({
		queryKey: ['entities', campaignId, normalizedType],
		queryFn: () => getEntities(campaignId, normalizedType),
		enabled: !!campaignId && !!normalizedType,
		staleTime: 1000 * 60 * 5,
	});

	// 2. Secondary Query (Locations - only if needed for tree building)
	const needsLocations = normalizedType === 'npc' || normalizedType === 'encounter';
	const locationQuery = useQuery({
		queryKey: ['entities', campaignId, 'location'],
		queryFn: () => getEntities(campaignId, 'location'),
		enabled: !!campaignId && needsLocations,
		staleTime: 1000 * 60 * 5,
	});

	// 3. Merge Results
	const mergedData = useMemo(() => {
		if (mainQuery.isLoading || (needsLocations && locationQuery.isLoading)) return [];

		let data = mainQuery.data || [];

		if (needsLocations && locationQuery.data) {
			// Deduplicate: Don't add locations if they are already in the main list (e.g. if type was 'location')
			const existingIds = new Set(data.map((e) => e.id));
			const newLocations = locationQuery.data.filter((l) => !existingIds.has(l.id));
			data = [...data, ...newLocations];
		}

		return data;
	}, [mainQuery.data, locationQuery.data, needsLocations, mainQuery.isLoading, locationQuery.isLoading]);

	return {
		entities: mergedData,
		isLoading: mainQuery.isLoading || (needsLocations && locationQuery.isLoading),
		error: mainQuery.error || locationQuery.error,
	};
}
