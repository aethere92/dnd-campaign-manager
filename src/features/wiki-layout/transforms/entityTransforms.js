import { getAttributeValue } from '../../../utils/entity/attributeParser';
import { getAffinityRank } from '../../../utils/status/statusHelpers';

// Helper to find parent relationship
const getParentId = (entity) => {
	const relationships = entity.relationships;
	if (!relationships || !Array.isArray(relationships)) return null;

	// 1. Check for explicit parent (Location hierarchy: Location -> Parent Location)
	const parentRel = relationships.find(
		(r) =>
			(r.type === 'parent_location' || r.type === 'parent') && (r.direction === 'outgoing' || r.direction === undefined)
	);
	if (parentRel) return parentRel.entity_id;

	// 2. Check for location link (NPC hierarchy: NPC -> Location)
	if (entity.type === 'npc') {
		// Get ALL relationships to locations
		const locationRels = relationships.filter((r) => r.entity_type === 'location');

		if (locationRels.length > 0) {
			// Priority 1: Look for specific semantic types
			const primary = locationRels.find((r) =>
				['location', 'located_in', 'base', 'home', 'residence', 'origin'].includes(r.type?.toLowerCase())
			);

			// Priority 2: Fallback to the first location found (e.g. generic 'related')
			return primary ? primary.entity_id : locationRels[0].entity_id;
		}
	}

	return null;
};

export function transformEntityToViewModel(entity, type) {
	// Context type (e.g. 'npc' or 'location')
	const contextType = type === 'sessions' ? 'session' : type;

	// Actual entity type (e.g. 'location' inside 'npc' view)
	const actualType = entity.type || contextType;

	// Extract raw values
	const statusRaw = getAttributeValue(entity.attributes, ['status', 'Quest Status']) || entity.status || 'unknown';
	const affinityRaw = getAttributeValue(entity.attributes, ['affinity', 'disposition']);

	const status = statusRaw.toLowerCase();
	const affinity = affinityRaw ? affinityRaw.toLowerCase() : 'unknown';

	// Determine effective sorting rank
	const effectiveSortString = affinity !== 'unknown' ? affinity : status;
	const affinityRank = getAffinityRank(effectiveSortString);

	// Extract Region & Quest Type
	const region = getAttributeValue(entity.attributes, ['region', 'parent location']) || 'Uncharted';
	const questType = getAttributeValue(entity.attributes, ['Quest Type', 'Type']) || 'Side Quest';

	// Extract Priority for Quests
	const priority = getAttributeValue(entity.attributes, ['Priority', 'priority']) || null;

	// Extract Parent ID using the smarter logic
	const parentId = getParentId(entity);

	return {
		id: entity.id,
		name: entity.name,
		path: entity.id,
		type: actualType, // Use actual type so icons render correctly

		status,
		affinity,
		attributes: entity.attributes || {},
		relationships: entity.relationships,

		meta: {
			status,
			affinity,
			affinityRank,
			region,
			questType,
			priority,
			parentId,
		},
	};
}
