import { useMemo } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { routes } from '@/app/routes';

/**
 * Campaign-scoped path builders with the current campaign already applied.
 *
 * Every campaign-scoped link needs the id from the URL. Passing it down as a prop
 * to all ~26 link sites would mean threading it through components that otherwise
 * have no interest in it (grid cards, table rows, graph canvases), and every
 * missed one is a link that silently drops the scope prefix.
 *
 * Reading it from context here keeps the call sites as short as the hardcoded
 * strings they replace:
 *
 *     const r = useCampaignRoutes();
 *     <Link to={r.wikiEntity('npc', id)} />
 */
export function useCampaignRoutes() {
	const { campaignId } = useCampaign();

	return useMemo(
		() => ({
			campaignId,
			dashboard: () => routes.campaign.dashboard(campaignId),
			timeline: () => routes.campaign.timeline(campaignId),
			relationships: () => routes.campaign.relationships(campaignId),
			atlas: (mapId) => routes.campaign.atlas(campaignId, mapId),
			wikiList: (type) => routes.campaign.wikiList(campaignId, type),
			wikiEntity: (type, entityId) => routes.campaign.wikiEntity(campaignId, type, entityId),
		}),
		[campaignId]
	);
}
