// Helper: Normalize affinity text to a numeric rank for sorting
const getAffinityRank = (item) => {
	const text = (item.affinity || item.status || '').toLowerCase();
	if (['ally', 'friend', 'friendly', 'helpful'].some((k) => text.includes(k))) return 1;
	if (['neutral', 'indifferent'].some((k) => text.includes(k))) return 2;
	if (['rival', 'enemy', 'hostile', 'villain'].some((k) => text.includes(k))) return 3;
	return 9; // Unknown/Other
};

// Helper: Safely get an attribute (case-insensitive)
const getAttr = (item, key) => {
	const attrs = item.attributes || {};
	// Try exact match, then lowercase match
	const val = attrs[key] || attrs[key.toLowerCase()] || attrs[key.charAt(0).toUpperCase() + key.slice(1)];

	if (!val) return null;
	// Handle { value: "..." } objects or Arrays
	if (typeof val === 'object' && val.value) return val.value;
	if (Array.isArray(val)) return val[0]?.value || val[0];
	return val;
};

export const GROUPING_CONFIG = {
	location: {
		// Group by 'Region' (or 'Parent Location')
		groupBy: (item) => getAttr(item, 'region') || getAttr(item, 'parent') || 'Uncharted',
		// Sort Groups Alphabetically
		sortGroups: 'alpha',
		// Sort Items Alphabetically
		sortItems: 'alpha',
	},
	faction: {
		// Group by Affinity (normalized to simple buckets)
		groupBy: (item) => {
			const rank = getAffinityRank(item);
			if (rank === 1) return 'Allies';
			if (rank === 2) return 'Neutral';
			if (rank === 3) return 'Enemies';
			return 'Unknown';
		},
		// Custom Order for Groups
		sortGroups: ['Allies', 'Neutral', 'Enemies', 'Unknown'],
		sortItems: 'alpha',
	},
	npc: {
		// Group by Location (from relationships)
		groupBy: (item) => {
			// First try direct attribute
			const directLocation = getAttr(item, 'location') || getAttr(item, 'residence');
			if (directLocation) return directLocation;

			// Then check relationships for location connections
			if (item.relationships && Array.isArray(item.relationships)) {
				const locationRel = item.relationships.find((rel) => rel.entity_type === 'location');
				if (locationRel) return locationRel.entity_name;
			}

			return 'Wanderers';
		},
		sortGroups: 'alpha',
		// Sort Items by Affinity Rank, then Name
		sortItems: (a, b) => getAffinityRank(a) - getAffinityRank(b) || a.name.localeCompare(b.name),
	},
};
