import { getAttributeValue } from '../../../utils/entity/attributeParser';
import { getAffinityRank } from '../../../utils/status/statusHelpers';

export function transformEntityToViewModel(entity, type) {
	const normalizedType = type === 'sessions' ? 'session' : type;

	// Extract raw values
	const statusRaw = entity.status || getAttributeValue(entity.attributes, ['status', 'Quest Status']) || 'unknown';
	const affinityRaw = getAttributeValue(entity.attributes, ['affinity', 'disposition']);

	const status = statusRaw.toLowerCase();
	const affinity = affinityRaw ? affinityRaw.toLowerCase() : 'unknown';

	// Determine effective sorting rank
	const effectiveSortString = affinity !== 'unknown' ? affinity : status;
	const affinityRank = getAffinityRank(effectiveSortString);

	// Extract Region
	const region = getAttributeValue(entity.attributes, ['region', 'parent location']) || 'Uncharted';

	// Extract Quest Type
	const questType = getAttributeValue(entity.attributes, ['Quest Type', 'Type']) || 'Side Quest';

	return {
		id: entity.id,
		name: entity.name,
		path: entity.id,
		type: normalizedType,

		status,
		affinity,
		attributes: entity.attributes,
		relationships: entity.relationships, // Now guaranteed to be present from the View

		meta: {
			status,
			affinity,
			affinityRank,
			region,
			questType,
		},
	};
}
