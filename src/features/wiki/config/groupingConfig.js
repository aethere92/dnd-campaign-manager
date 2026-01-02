export const GROUPING_CONFIG = {
	location: {
		mode: 'tree',
		sortItems: (a, b) => a.name.localeCompare(b.name),
	},
	encounter: {
		mode: 'tree',
		sortItems: (a, b) => {
			if (a.type !== b.type) {
				if (a.type === 'location') return -1;
				if (b.type === 'location') return 1;
			}
			return a.name.localeCompare(b.name);
		},
	},
	npc: {
		mode: 'tree',
		sortItems: (a, b) => {
			if (a.type !== b.type) {
				if (a.type === 'location') return -1;
				if (b.type === 'location') return 1;
			}
			if (a.type === 'npc' && b.type === 'npc') {
				const rankDiff = a.meta.affinityRank - b.meta.affinityRank;
				if (rankDiff !== 0) return rankDiff;
			}
			return a.name.localeCompare(b.name);
		},
	},
	session: {
		// Group by Arc ID
		groupBy: (item, context) => {
			if (context?.sessionArcMap) {
				const arcId = context.sessionArcMap.get(item.id);
				if (arcId) return arcId;
			}
			return 'ungrouped';
		},

		// Map View Data to UI Props
		getGroupMeta: (arcId, context) => {
			if (arcId === 'ungrouped') return { title: 'Uncharted / Side Adventures', order: 9999 };

			const arc = context?.arcs?.find((a) => a.id === arcId);
			if (!arc) return { title: 'Unknown Arc', order: 9998 };

			return {
				title: arc.title,
				description: arc.description,
				order: arc.order,
				type: arc.arc_type, // Maps SQL 'arc_type'
				stats: {
					npcs: arc.npc_count,
					locations: arc.location_count,
					quests: arc.quest_count,
					encounters: arc.encounter_count,
				},
			};
		},

		sortGroups: (ids, context) => {
			return ids.sort((a, b) => {
				if (a === 'ungrouped') return 1;
				if (b === 'ungrouped') return -1;
				const arcA = context?.arcs?.find((x) => x.id === a);
				const arcB = context?.arcs?.find((x) => x.id === b);
				return (arcA?.order || 999) - (arcB?.order || 999);
			});
		},

		sortItems: (a, b) => {
			const numA = Number(a.attributes?.session_number || 0);
			const numB = Number(b.attributes?.session_number || 0);
			if (numA !== 0 || numB !== 0) return numA - numB;
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
