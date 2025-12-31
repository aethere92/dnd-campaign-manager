import { MapPin, Flag, Circle, Swords, Users, Archive, LayoutGrid, Folder } from 'lucide-react';

export const VIEW_STRATEGIES = {
	location: { mode: 'geo' },
	encounter: { mode: 'geo' },
	npc: { mode: 'geo' },
	faction: { mode: 'category' },
	quest: { mode: 'category' },
	character: { mode: 'flat' },
	item: { mode: 'flat' },
	session: { mode: 'category' },
};

// Recursive Flattening with Deduplication
const flattenGeoTree = (nodes, targetType, parentName = 'Uncharted', visitedIds) => {
	let lanes = [];
	const directItems = [];

	nodes.forEach((node) => {
		// 1. Handle "Children" (Traverse deeper first)
		if (node.children && node.children.length > 0) {
			const childLanes = flattenGeoTree(node.children, targetType, node.name, visitedIds);

			// Check for direct items inside this folder
			const myContent = childLanes.find((l) => l.title === null);

			if (myContent && myContent.items.length > 0) {
				lanes.push({
					id: node.id,
					title: node.name,
					parentTitle: parentName,
					link: `/wiki/${node.type}/${node.id}`,
					items: myContent.items,
				});
			}
			lanes = [...lanes, ...childLanes.filter((l) => l.title !== null)];
		}

		// 2. Handle "Self" (Is this node a target item?)
		if (node.type === targetType) {
			if (!visitedIds.has(node.id)) {
				visitedIds.add(node.id);
				directItems.push(node);
			}
		}
	});

	if (directItems.length > 0) {
		lanes.push({ id: `misc-${parentName}`, title: null, parentTitle: parentName, link: null, items: directItems });
	}
	return lanes;
};

export const getSwimlanes = (groups, normalizedType) => {
	if (groups.length === 0) return [];

	const strategy = VIEW_STRATEGIES[normalizedType] || VIEW_STRATEGIES.location;

	// STRATEGY 1: GEOGRAPHICAL (Tree Unrolling)
	if (strategy.mode === 'geo' && groups[0].isTree) {
		const rootItems = groups[0].items;
		const visitedIds = new Set();

		const rawLanes = flattenGeoTree(rootItems, normalizedType, null, visitedIds);

		const rootLane = rawLanes.find((l) => l.title === null);
		const otherLanes = rawLanes.filter((l) => l.title !== null);

		if (rootLane) {
			otherLanes.push({ ...rootLane, title: 'Uncharted / General', id: 'root-ungrouped' });
		}
		return otherLanes;
	}

	// STRATEGY 2: CATEGORICAL (Flat Groups)
	if (strategy.mode === 'category') {
		return groups.map((g) => ({
			id: g.id,
			title: g.title || 'Other',
			link: null,
			items: g.items,
		}));
	}

	// STRATEGY 3: FLAT (One big group)
	if (strategy.mode === 'flat') {
		const allItems = groups.flatMap((g) => g.items).sort((a, b) => a.name.localeCompare(b.name));
		return [
			{
				id: 'all',
				title: 'All Entries',
				link: null,
				items: allItems,
			},
		];
	}

	return [];
};

export const getStrategyMode = (type) => {
	return VIEW_STRATEGIES[type]?.mode || 'flat';
};
