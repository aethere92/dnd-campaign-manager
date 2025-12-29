import { getAttributeValue } from '../../../utils/entity/attributeParser';
import { getAffinityRank } from '../../../utils/status/statusHelpers';
import { getParentId } from '../../../utils/entity/entityHelpers';

// ... (Rest of file remains unchanged) ...
export function transformEntityToViewModel(entity, type) {
	// ... existing implementation ...
	// (This function calls getParentId internally, so no changes needed inside it)
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
		type: actualType,

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
