import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import { getAffinityRank } from '@/domain/entity/utils/statusUtils';
import { getParentId, normalizeTypeParam } from '@/domain/entity/utils/entityUtils';
import { stripMarkdown } from '@/shared/utils/textUtils';

export function transformEntityToViewModel(entity, type) {
	const contextType = normalizeTypeParam(type);
	const actualType = entity.type || contextType;
	const attributes = entity.attributes || {};

	// 1. Resolve Status
	const statusRaw = getAttributeValue(attributes, ['status', 'Quest Status']) || entity.status || 'unknown';
	const affinityRaw = getAttributeValue(attributes, ['affinity', 'disposition']);
	const status = statusRaw.toLowerCase();
	const affinity = affinityRaw ? affinityRaw.toLowerCase() : 'unknown';
	const affinityRank = getAffinityRank(affinity !== 'unknown' ? affinity : status);

	// 2. Resolve Meta Fields
	const questType = getAttributeValue(attributes, ['Quest Type', 'Type']) || 'Side Quest';
	const region = getAttributeValue(attributes, ['region', 'parent location']) || null;
	const priority = getAttributeValue(attributes, ['Priority', 'priority']) || null;
	const parentId = getParentId(entity);
	const campaignArc = getAttributeValue(attributes, ['campaign_arc', 'arc']);

	// 3. Resolve Description
	// We need two versions:
	// - One for the Card (short, plain text)
	// - One for the Header (long, markdown preserved)
	let rawDescription = entity.description;

	if (actualType === 'session') {
		rawDescription = entity.description || getAttributeValue(attributes, ['narrative', 'summary']);
	} else {
		rawDescription =
			getAttributeValue(attributes, ['synopsis', 'summary', 'short_description', 'hook']) || entity.description;
	}

	// Version A: For Grid Cards (single-line, stripped & truncated)
	const description = rawDescription
		? stripMarkdown(rawDescription, { collapseWhitespace: true }).substring(0, 140) +
			(rawDescription.length > 140 ? '...' : '')
		: null;

	// Version B: For Hero Headers — raw string, so Swimlane owns the truncation
	const fullDescription = rawDescription || null;

	// 4. Resolve Footer Label
	let footerLabel = null;
	if (actualType === 'session') {
		footerLabel = attributes.session_date || attributes.Date || `Session ${attributes.session_number || '#'}`;
	} else if (actualType === 'npc') {
		footerLabel = getAttributeValue(attributes, ['role', 'occupation', 'class', 'title']);
	} else if (actualType === 'location') {
		footerLabel = getAttributeValue(attributes, ['type']) || region;
	} else if (actualType === 'encounter') {
		footerLabel = getAttributeValue(attributes, ['status']) || 'Encounter';
	} else if (actualType === 'quest') {
		footerLabel = questType;
	} else if (actualType === 'item') {
		const rarity = getAttributeValue(attributes, ['rarity']);
		const type = getAttributeValue(attributes, ['type', 'item_type']) || 'Item';
		footerLabel = rarity ? `${rarity} ${type}` : type;
	}

	if (!footerLabel) {
		footerLabel = region || getAttributeValue(attributes, ['type', 'subtype']);
	}

	// 5. Resolve Hero Subtitle
	let heroSubtitle = footerLabel;
	if (actualType === 'character') {
		const role = getAttributeValue(attributes, ['class', 'role', 'occupation']);
		const level = getAttributeValue(attributes, ['level']);
		if (level && role) heroSubtitle = `Lvl ${level} ${role}`;
		else if (level) heroSubtitle = `Level ${level}`;
		else heroSubtitle = role;
	}

	return {
		id: entity.id,
		name: entity.name,
		// No `path` here: it was an unscoped `/wiki/...` string, and now that links
		// are campaign-scoped the two sidebar consumers build the path themselves
		// from type + id via useCampaignRoutes. Emitting a stale path would just
		// invite a future miswire.
		type: actualType,

		// UI Props
		description, // Short (Cards)
		fullDescription, // New: Long (Headers)
		footerLabel,
		heroSubtitle,

		status,
		affinity,
		attributes,
		relationships: entity.relationships,

		meta: {
			status,
			affinity,
			affinityRank,
			questType,
			region,
			priority,
			parentId,
			campaignArc,
		},
	};
}
