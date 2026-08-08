/**
 * Invalidate every cache an entity mutation can affect.
 *
 * Admin writes go through database triggers that sync the typed tables
 * (npcs, locations, quests, …) into the unified `entities` table, which in turn
 * feeds views used by search, the graph, the timeline, the dashboard and the wiki.
 * A single save therefore has broad, legitimate reach — narrowing the invalidation
 * risks leaving one of those surfaces showing stale data, which is exactly the kind
 * of silent bug that is hard to notice.
 *
 * This replaces a bare `queryClient.invalidateQueries()` (invalidate *everything*,
 * including unrelated caches) with an explicit, documented list of the keys that
 * entity data actually flows into. `tooltip` is intentionally omitted: it is keyed
 * per entity id and refetches on next hover, so it does not need a broad sweep.
 */
const ENTITY_DERIVED_KEYS = [
	'admin-list', // the admin list/table view
	'entities', // typed entity lists
	'entityIndex', // smart-text entity resolution
	'entry', // single wiki entry
	'globalSearch', // search results
	'graph', // relationship graph
	'timeline', // campaign timeline
	'dashboard_final', // dashboard widgets
	'campaign', // campaign row (name/attrs can change via the campaign editor)
	'campaigns', // campaign list (create/delete/rename)
];

export function invalidateEntityData(queryClient) {
	return Promise.all(ENTITY_DERIVED_KEYS.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
}
