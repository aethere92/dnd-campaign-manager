import { useQuery } from '@tanstack/react-query';
import { getEntityIndex } from '@/domain/entity/api/entityService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import { getParentId } from '@/domain/entity/utils/entityUtils'; // You added this util previously

export function useEntityIndex() {
	const { campaignId } = useCampaign();

	const { data } = useQuery({
		queryKey: ['entityIndex', campaignId],
		queryFn: async () => {
			const rawData = await getEntityIndex(campaignId);

			const list = [];
			const map = new Map();

			rawData.forEach((entity) => {
				const attrs = parseAttributes(entity.attributes);
				const lightEntity = {
					...entity,
					// Pre-calculate hierarchy once
					parentId: getParentId(entity),
					// Resolve Icon once
					iconUrl: resolveImageUrl(attrs, 'icon'),
				};

				// Remove heavy relationships array to save memory
				delete lightEntity.relationships;

				list.push(lightEntity);
				map.set(entity.id, lightEntity);
			});

			// Return optimized structures
			return {
				list: list.sort((a, b) => b.name.length - a.name.length),
				map,
			};
		},
		staleTime: 1000 * 60 * 30, // 30 mins
		enabled: !!campaignId,
	});

	// Default return shape
	return data || { list: [], map: new Map() };
}
