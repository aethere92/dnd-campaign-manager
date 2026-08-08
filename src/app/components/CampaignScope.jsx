import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { routes } from '@/app/routes';
import { RouteLoading } from './RouteLoading';
import { NotFound } from './NotFound';

/**
 * Layout route for everything under `/c/:campaignId`.
 *
 * This is the seam where the URL becomes the source of truth for "which
 * campaign". It replaces a `campaignId ? <Route…> : <Route…>` ternary that
 * changed the router's *shape* based on fetched data — which meant a hard refresh
 * of a deep link could redirect to campaign selection and discard the URL the
 * user actually asked for.
 *
 * The four states are kept distinct on purpose:
 *   - invalid id in the URL  -> 404 (do not silently redirect)
 *   - request in flight      -> spinner
 *   - request found nothing  -> 404
 *   - resolved               -> render the app
 */
export const CampaignScope = () => {
	const { campaignId: rawId } = useParams();
	const { campaignId, setCampaignId, isLoading, isError, notFound } = useCampaign();

	// campaigns.id is a UUID string — kept as-is, not parsed.
	const urlId = rawId || null;

	// Mirror the URL into context so the ~40 components reading `campaignId` from
	// context keep working unchanged, and so it is remembered as the default for a
	// later visit to bare `/`.
	useEffect(() => {
		if (urlId && urlId !== campaignId) {
			setCampaignId(urlId);
		}
	}, [urlId, campaignId, setCampaignId]);

	if (!urlId) {
		return <NotFound title='Not a valid campaign' detail='The URL is missing a campaign id.' />;
	}

	// Until context has caught up with the URL, the data below belongs to the
	// previous campaign — render the spinner rather than one frame of wrong data.
	if (urlId !== campaignId || isLoading) {
		return <RouteLoading text='Loading campaign...' />;
	}

	// A query error (e.g. a malformed id that the DB rejects) is a dead end, not a
	// perpetual load. Surface it rather than spinning forever.
	if (isError) {
		return <NotFound title='Could not load campaign' detail={`Something went wrong loading campaign "${urlId}".`} />;
	}

	if (notFound) {
		return <NotFound title='Campaign not found' detail={`No campaign with id ${urlId}. It may have been deleted.`} />;
	}

	return <Outlet />;
};

/**
 * Entry point for bare `/`. Sends the visitor to their last-used campaign, or to
 * the picker if there isn't one. Kept separate from CampaignScope so that the
 * "remembered campaign" behaviour lives at exactly one route.
 */
export const CampaignRedirect = () => {
	const { campaignId } = useCampaign();

	if (campaignId) {
		return <Navigate to={routes.campaign.root(campaignId)} replace />;
	}
	return <Navigate to={routes.selectCampaign()} replace />;
};
