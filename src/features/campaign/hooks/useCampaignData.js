import { useQuery } from '@tanstack/react-query';
import { getCampaignById } from '@/features/campaign/api/campaignService';
import { CAMPAIGN_REGISTRY } from '@/features/atlas/utils/mapNavigation';

/**
 * Loads one campaign by `campaigns.id` and resolves its bundled map config.
 *
 * TanStack Query rather than a hand-rolled effect because route resolution depends
 * on this hook: the guard needs to tell "still loading" apart from "no such
 * campaign", and ad-hoc effect state cannot express that reliably. `isPending`
 * and a completed-but-empty result can.
 *
 * The id here is `campaigns.id` — the value every entity row's `campaign_id`
 * column references. See getCampaignById for why the similarly-named
 * `campaigns.campaign_id` column is the wrong key to resolve by.
 */
export function useCampaignData(campaignId) {
	const { data, isPending, isError, error } = useQuery({
		queryKey: ['campaign', campaignId],
		queryFn: () => getCampaignById(campaignId),
		enabled: campaignId != null,
	});

	// The map config ships in the bundle, keyed by a string stored on the row.
	const mapDataKey = data?.attributes?.map_data;
	const campaignData = mapDataKey ? (CAMPAIGN_REGISTRY[mapDataKey] ?? null) : null;

	if (mapDataKey && !campaignData) {
		console.warn(`[useCampaignData] Registry key not found: ${mapDataKey}`);
	}

	return {
		campaignRow: data ?? null,
		campaignData,
		// Only loading while a request is genuinely in flight. With no id the query
		// is disabled, and isPending would otherwise stay true forever.
		isLoading: campaignId != null && isPending,
		isError,
		error,
		// Request finished and matched nothing — distinct from "not asked" and
		// "in flight". This is what the route guard renders a 404 for.
		notFound: campaignId != null && !isPending && !isError && !data,
	};
}
