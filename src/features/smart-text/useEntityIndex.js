import { useQuery } from '@tanstack/react-query';
import { getEntityIndex } from '../../services/entities';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import './types';

// Duplicated helper (ideally move to a utils file, but keeping self-contained here)
const getImageUrl = (attrs) => {
	if (!attrs) return null;
	const parsed = typeof attrs === 'string' ? JSON.parse(attrs) : attrs;

	// Prioritize small icons for the index
	const keys = ['icon', 'token', 'portrait', 'image'];

	let rawUrl = null;
	for (const key of keys) {
		const val = parsed[key] || parsed[key.toLowerCase()];
		if (!val) continue;
		if (Array.isArray(val) && val[0]?.value) rawUrl = val[0].value;
		else if (typeof val === 'string') rawUrl = val;
		if (rawUrl) break;
	}

	if (!rawUrl) return null;
	rawUrl = rawUrl.trim();
	let cleanPath = rawUrl.replace(/^(\.\.\/)+/, '');
	if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
	return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export function useEntityIndex() {
	const { campaignId } = useCampaign();

	const { data } = useQuery({
		queryKey: ['entityIndex', campaignId],
		queryFn: async () => {
			const rawData = await getEntityIndex(campaignId);
			// Pre-process the icon URL so components don't have to parse JSON 50 times
			return rawData.map((entity) => ({
				...entity,
				iconUrl: getImageUrl(entity.attributes),
			}));
		},
		staleTime: 1000 * 60 * 30,
		enabled: !!campaignId,
	});

	return data || [];
}
