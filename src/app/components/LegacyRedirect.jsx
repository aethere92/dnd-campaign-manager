import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { routes } from '@/app/routes';
import { NotFound } from './NotFound';

/**
 * Forwards pre-`/c/:campaignId` URLs to the equivalent scoped route.
 *
 * Links to `#/wiki/npc/abc` already exist in session notes and browser history
 * from before campaigns were part of the URL. Those paths carry no campaign, so
 * the best available answer is the last-used one — the same campaign the old
 * localStorage-only build would have shown.
 *
 * Delete this once the old links no longer matter.
 */
export const LegacyRedirect = () => {
	const location = useLocation();
	const { campaignId } = useCampaign();

	if (!campaignId) {
		// Nothing to resolve against; let the picker take over and preserve intent.
		return <Navigate to={routes.selectCampaign()} replace />;
	}

	// Re-attach the scope prefix, keeping any query string and sub-path intact.
	const suffix = location.pathname === '/' ? '' : location.pathname;
	const target = `${routes.campaign.root(campaignId)}${suffix}${location.search}`;

	return <Navigate to={target} replace />;
};

/**
 * `/wiki/:type/:entityId` in the old shape — same handling as above, but declared
 * separately so the intent is obvious in the route table.
 */
export const LegacyWikiRedirect = () => {
	const { type, entityId } = useParams();
	const { campaignId } = useCampaign();

	if (!campaignId) return <Navigate to={routes.selectCampaign()} replace />;
	if (!type) return <NotFound />;

	const target = entityId
		? routes.campaign.wikiEntity(campaignId, type, entityId)
		: routes.campaign.wikiList(campaignId, type);

	return <Navigate to={target} replace />;
};
