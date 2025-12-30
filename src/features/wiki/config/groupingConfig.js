export const GROUPING_CONFIG = {
	location: {
		mode: 'tree',
		sortItems: (a, b) => a.name.localeCompare(b.name),
	},
	encounter: {
		mode: 'tree',
		sortItems: (a, b) => {
			// 1. Folders (Locations) first
			if (a.type !== b.type) {
				if (a.type === 'location') return -1;
				if (b.type === 'location') return 1;
			}
			// 2. Then Sort Encounters Alphabetically
			return a.name.localeCompare(b.name);
		},
	},
	npc: {
		mode: 'tree', // Changed from groupBy to tree
		sortItems: (a, b) => {
			// Locations (folders) should generally come first or sort A-Z
			if (a.type !== b.type) {
				// Locations first
				if (a.type === 'location') return -1;
				if (b.type === 'location') return 1;
			}

			// For NPCs: Rank by Affinity, then Name
			if (a.type === 'npc' && b.type === 'npc') {
				const rankDiff = a.meta.affinityRank - b.meta.affinityRank;
				if (rankDiff !== 0) return rankDiff;
			}

			return a.name.localeCompare(b.name);
		},
	},
	faction: {
		groupBy: (item) => {
			const rank = item.meta.affinityRank;
			if (rank === 1) return 'Allies';
			if (rank === 2) return 'Neutral';
			if (rank === 3) return 'Enemies';
			return 'Unknown';
		},
		sortGroups: ['Allies', 'Neutral', 'Enemies', 'Unknown'],
		sortItems: (a, b) => a.name.localeCompare(b.name),
	},
	quest: {
		groupBy: (item) => {
			const t = item.meta.questType.toLowerCase();
			if (t.includes('main')) return 'Main Quest';
			if (t.includes('personal')) return 'Personal Quest';
			return 'Side Quest';
		},
		sortGroups: ['Main Quest', 'Personal Quest', 'Side Quest'],
		sortItems: (a, b) => {
			const statusOrder = ['active', 'in progress', 'pending', 'completed', 'success', 'failed', 'abandoned'];
			const idxA = statusOrder.indexOf(a.meta.status);
			const idxB = statusOrder.indexOf(b.meta.status);
			const valA = idxA === -1 ? 99 : idxA;
			const valB = idxB === -1 ? 99 : idxB;
			if (valA !== valB) return valA - valB;
			return a.name.localeCompare(b.name);
		},
	},
};
