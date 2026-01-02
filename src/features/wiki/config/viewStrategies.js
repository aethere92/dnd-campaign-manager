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

// Recursive Flattening
const flattenGeoTree = (nodes, targetType, parentName = 'Uncharted', visitedIds) => {
	let lanes = [];
	const directItems = [];

	nodes.forEach((node) => {
		if (node.children && node.children.length > 0) {
			const childLanes = flattenGeoTree(node.children, targetType, node.name, visitedIds);
			const myContent = childLanes.find((l) => l.title === null);

			if (myContent && myContent.items.length > 0) {
				lanes.push({
					id: node.id,
					title: node.name,
					parentTitle: parentName,
					link: `/wiki/${node.type}/${node.id}`,
					items: myContent.items,
					description: node.fullDescription || node.description,
				});
			}
			lanes = [...lanes, ...childLanes.filter((l) => l.title !== null)];
		}

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

	// STRATEGY 1: GEOGRAPHICAL
	if (strategy.mode === 'geo' && groups[0].isTree) {
		const rootItems = groups[0].items;
		const visitedIds = new Set();
		const rawLanes = flattenGeoTree(rootItems, normalizedType, null, visitedIds);
		const rootLane = rawLanes.find((l) => l.title === null);
		const otherLanes = rawLanes.filter((l) => l.title !== null);

		if (rootLane) {
			otherLanes.push({ ...rootLane, title: 'Uncharted entries', id: 'root-ungrouped' });
		}
		return otherLanes;
	}

	// STRATEGY 2: CATEGORICAL
	if (strategy.mode === 'category') {
		return groups.map((g) => ({
			id: g.id,
			title: g.title || 'Other',
			link: null,
			items: g.items,
			description: g.description,
			type: g.type,
			stats: g.stats,
			order: g.order,
		}));
	}

	// STRATEGY 3: FLAT
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
