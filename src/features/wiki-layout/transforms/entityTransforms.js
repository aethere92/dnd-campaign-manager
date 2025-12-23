import { getAttributeValue } from '../../../utils/entity/attributeParser';
import { getAffinityRank } from '../../../utils/status/statusHelpers';

// Helper to find parent relationship
const getParentId = (relationships) => {
	if (!relationships || !Array.isArray(relationships)) return null;
	// Look for outgoing 'parent_location' relationship
	const parentRel = relationships.find(
		(r) =>
			(r.type === 'parent_location' || r.type === 'parent') && (r.direction === 'outgoing' || r.direction === undefined) // Handle unidirectional logic safely
	);
	return parentRel ? parentRel.entity_id : null;
};

export function transformEntityToViewModel(entity, type) {
	const normalizedType = type === 'sessions' ? 'session' : type;

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

	// NEW: Extract Parent ID for hierarchical trees
	const parentId = getParentId(entity.relationships);

	return {
		id: entity.id,
		name: entity.name,
		path: entity.id,
		type: normalizedType,

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
			parentId, // Exposed for tree builder
		},
	};
}
