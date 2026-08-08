/**
 * Every URL in the app, in one place.
 *
 * Two reasons this exists rather than inline path strings:
 *
 * 1. Campaign-scoped paths need the campaign id woven in
 *    (`/c/2/wiki/npc/abc`). Building that by hand at ~30 call sites means ~30
 *    chances to forget the prefix, and a forgotten prefix is a broken link that
 *    still looks plausible.
 * 2. `navConfig` used to keep its own parallel copy of the same paths, so a
 *    renamed segment had to be found by hand in two places. It now consumes these
 *    builders.
 *
 * These are deliberately plain functions, not a path DSL — a generic
 * pattern-matching abstraction ends up harder to read than the strings it hides.
 */

/** Path segment prefixing every campaign-scoped route. */
export const CAMPAIGN_SEGMENT = 'c';

/**
 * Routes that live outside any campaign.
 *
 * `/dm` is intentionally NOT campaign-scoped: the admin console has its own
 * campaign switcher and manages the campaign list itself.
 */
export const routes = {
	selectCampaign: () => '/select-campaign',

	/** Campaign-scoped app routes. `campaignId` is the public `campaign_id`. */
	campaign: {
		root: (campaignId) => `/${CAMPAIGN_SEGMENT}/${campaignId}`,
		dashboard: (campaignId) => `/${CAMPAIGN_SEGMENT}/${campaignId}`,
		timeline: (campaignId) => `/${CAMPAIGN_SEGMENT}/${campaignId}/timeline`,
		relationships: (campaignId) => `/${CAMPAIGN_SEGMENT}/${campaignId}/relationships`,

		/** Without a mapId the atlas route resolves the campaign's own default. */
		atlas: (campaignId, mapId) =>
			mapId ? `/${CAMPAIGN_SEGMENT}/${campaignId}/atlas/${mapId}` : `/${CAMPAIGN_SEGMENT}/${campaignId}/atlas`,

		/** Landing page listing every entity of one type. */
		wikiList: (campaignId, type) => `/${CAMPAIGN_SEGMENT}/${campaignId}/wiki/${type}`,

		/** A single entity. The most-used builder in the app. */
		wikiEntity: (campaignId, type, entityId) => `/${CAMPAIGN_SEGMENT}/${campaignId}/wiki/${type}/${entityId}`,
	},

	/** Admin console. Not campaign-scoped — see note above. */
	admin: {
		root: () => '/dm',
		login: () => '/dm/login',
		manage: (type, id) => (id ? `/dm/manage/${type}/${id}` : `/dm/manage/${type}`),
		replaceTool: () => '/dm/tools/replace',
		migrationTool: () => '/dm/tools/migration',
		atlasTool: () => '/dm/tools/atlas',
	},
};

/**
 * Route *patterns* for <Route path>, kept beside the builders so the two cannot
 * drift apart. Relative where they sit inside a parent route.
 */
export const routePatterns = {
	campaignScope: `/${CAMPAIGN_SEGMENT}/:campaignId`,
	timeline: 'timeline',
	relationships: 'relationships',
	atlas: 'atlas',
	atlasMap: 'atlas/:mapId',
	wikiType: 'wiki/:type',
	wikiEntity: ':entityId',
};
