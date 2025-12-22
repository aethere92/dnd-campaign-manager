export const GROUPING_CONFIG = {
	location: {
		// Group by Pre-calculated Region
		groupBy: (item) => item.meta.region,

		// Sort Groups Alphabetically
		sortGroups: 'alpha',

		// Sort Items Alphabetically
		sortItems: (a, b) => a.name.localeCompare(b.name),
	},
	faction: {
		// Group by Affinity Rank
		groupBy: (item) => {
			const rank = item.meta.affinityRank;
			if (rank === 1) return 'Allies';
			if (rank === 2) return 'Neutral';
			if (rank === 3) return 'Enemies';
			return 'Unknown';
		},
		// Explicit Order
		sortGroups: ['Allies', 'Neutral', 'Enemies', 'Unknown'],
		sortItems: (a, b) => a.name.localeCompare(b.name),
	},
	npc: {
		// Group by Location
		groupBy: (item) => {
			// Check relationships first (dynamic locations)
			if (item.relationships && Array.isArray(item.relationships)) {
				const locationRel = item.relationships.find((rel) => rel.entity_type === 'location');
				if (locationRel) return locationRel.entity_name;
			}
			// Fallback to static region attribute
			return item.meta.region !== 'Uncharted' ? item.meta.region : 'Wanderers';
		},
		sortGroups: 'alpha',

		// SORT FIX: Sort by Affinity Rank (Ally -> Neutral -> Enemy), then Name
		sortItems: (a, b) => {
			const rankDiff = a.meta.affinityRank - b.meta.affinityRank;
			if (rankDiff !== 0) return rankDiff;
			return a.name.localeCompare(b.name);
		},
	},
	quest: {
		// Group by Quest Type
		groupBy: (item) => {
			const t = item.meta.questType.toLowerCase();
			if (t.includes('main')) return 'Main Quest';
			if (t.includes('personal')) return 'Personal Quest';
			return 'Side Quest';
		},

		// Order: Main > Personal > Side
		sortGroups: ['Main Quest', 'Personal Quest', 'Side Quest'],

		// Sort items by status priority (Active first), then name
		sortItems: (a, b) => {
			const statusOrder = ['active', 'in progress', 'pending', 'completed', 'success', 'failed', 'abandoned'];
			const idxA = statusOrder.indexOf(a.meta.status);
			const idxB = statusOrder.indexOf(b.meta.status);

			// Handle unknown statuses (push to bottom)
			const valA = idxA === -1 ? 99 : idxA;
			const valB = idxB === -1 ? 99 : idxB;

			if (valA !== valB) {
				return valA - valB;
			}
			return a.name.localeCompare(b.name);
		},
	},
};
