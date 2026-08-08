import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { fetchCampaignMaps } from '@/features/atlas/api/mapService';
import { routes } from '@/app/routes';
import { RouteLoading } from '@/app/components/RouteLoading';
import { NotFound } from '@/app/components/NotFound';

/**
 * Resolves bare `/c/:campaignId/atlas` to that campaign's default map.
 *
 * The maps live in Supabase (the `maps` table, one row per map keyed by `key`).
 * This used to validate the campaign's `defaultMap` against a hardcoded JS config
 * object whose keys had drifted from the real Supabase keys — so a perfectly valid
 * default (e.g. campaign 1's `world_maps`) failed the check, warned, and fell back
 * to an arbitrary map. We now ask Supabase for the real keys and pick against those:
 *
 *   1. the campaign's declared defaultMap, if it's a real map key
 *   2. else a world/overview-looking map (nice default for campaigns with none set)
 *   3. else the first map the campaign has
 *   4. else a clean "no maps" state (e.g. a brand-new campaign with none yet)
 *
 * Maps are not shared between campaigns — every row belongs to one campaign — so a
 * per-campaign lookup is always self-contained.
 */
export default function AtlasDefaultRedirect() {
	const { campaignId } = useParams();
	const { campaignRow } = useCampaign();

	const { data: maps, isLoading } = useQuery({
		queryKey: ['campaign_maps', campaignId],
		queryFn: () => fetchCampaignMaps(campaignId),
		enabled: !!campaignId,
	});

	if (isLoading) return <RouteLoading text='Loading atlas...' />;

	const keys = (maps || []).map((m) => m.key);

	if (keys.length === 0) {
		return <NotFound title='No maps yet' detail='This campaign has no maps in its atlas.' />;
	}

	const declared = campaignRow?.attributes?.defaultMap;
	const overview = keys.find((k) => /world|faerun|overview|region|vale/i.test(k));

	const target = (declared && keys.includes(declared) && declared) || overview || keys[0];

	if (declared && !keys.includes(declared)) {
		console.warn(
			`[atlas] campaign defaultMap "${declared}" is not one of this campaign's maps [${keys.join(', ')}]; using "${target}".`
		);
	}

	return <Navigate to={routes.campaign.atlas(campaignId, target)} replace />;
}
