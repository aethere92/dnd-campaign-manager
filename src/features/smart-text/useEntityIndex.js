import { useQuery } from '@tanstack/react-query';
import { getEntityIndex } from '../../services/entities';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { resolveImageUrl, parseAttributes } from '../../utils/image/imageResolver'; // Use util
import './types';

export function useEntityIndex() {
	const { campaignId } = useCampaign();

	const { data } = useQuery({
		queryKey: ['entityIndex', campaignId],
		queryFn: async () => {
			const rawData = await getEntityIndex(campaignId);
			return rawData.map((entity) => {
				const attrs = parseAttributes(entity.attributes);
				return {
					...entity,
					// Use standard resolver
					iconUrl: resolveImageUrl(attrs, 'icon'),
				};
			});
		},
		staleTime: 1000 * 60 * 30,
		enabled: !!campaignId,
	});

	return data || [];
}
