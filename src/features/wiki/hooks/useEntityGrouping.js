import { useMemo } from 'react';
import { GROUPING_CONFIG } from '@/features/wiki/config/groupingConfig';
import { transformEntityToViewModel } from '@/features/wiki/utils/wikiUtils';

// Helper to build hierarchy trees (unchanged)
const buildTree = (items, sortFn) => {
	const idMap = new Map();
	const roots = [];
	items.forEach((item) => idMap.set(item.id, { ...item, children: [] }));
	items.forEach((item) => {
		const node = idMap.get(item.id);
		const parentId = item.meta.parentId;
		if (parentId && idMap.has(parentId)) {
			idMap.get(parentId).children.push(node);
		} else {
			roots.push(node);
		}
	});

	const prune = (nodes) => {
		const hasMixedTypes = items.some((i) => i.type !== 'location');
		if (!hasMixedTypes) return nodes;

		return nodes.filter((node) => {
			if (node.children.length > 0) {
				node.children = prune(node.children);
			}
			if (node.type === 'location' && node.children.length === 0) {
				return false;
			}
			return true;
		});
	};

	let finalRoots = prune(roots);

	const sortRecursive = (nodes) => {
		if (sortFn) nodes.sort(sortFn);
		nodes.forEach((node) => {
			if (node.children.length > 0) {
				sortRecursive(node.children);
			}
		});
	};

	sortRecursive(finalRoots);
	return finalRoots;
};

export function useEntityGrouping(entities, type, searchQuery = '', context = {}) {
	return useMemo(() => {
		if (!entities || entities.length === 0) return [];

		const filtered = searchQuery
			? entities.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: entities;

		const items = filtered.map((entity) => transformEntityToViewModel(entity, type));
		const strategy = GROUPING_CONFIG[type];

		// TREE STRATEGY
		if (strategy?.mode === 'tree') {
			const treeRoots = buildTree(items, strategy.sortItems);
			return [
				{
					id: 'root',
					title: null,
					items: treeRoots,
					isTree: true,
				},
			];
		}

		// CATEGORY STRATEGY
		if (strategy && strategy.groupBy) {
			const grouped = {};
			const metadataMap = new Map(); // Store metadata for the group keys

			items.forEach((item) => {
				const groupKey = strategy.groupBy(item, context) || 'General';

				if (!grouped[groupKey]) {
					grouped[groupKey] = [];
					// If the strategy provides a way to get metadata for this key, fetch it
					if (strategy.getGroupMeta) {
						metadataMap.set(groupKey, strategy.getGroupMeta(groupKey, context));
					}
				}
				grouped[groupKey].push(item);
			});

			let groupKeys = Object.keys(grouped);

			// Handle Sorting Groups
			if (typeof strategy.sortGroups === 'function') {
				groupKeys = strategy.sortGroups(groupKeys, context);
			} else if (Array.isArray(strategy.sortGroups)) {
				groupKeys.sort((a, b) => {
					const idxA = strategy.sortGroups.indexOf(a);
					const idxB = strategy.sortGroups.indexOf(b);
					const valA = idxA === -1 ? 999 : idxA;
					const valB = idxB === -1 ? 999 : idxB;
					return valA - valB || a.localeCompare(b);
				});
			} else {
				groupKeys.sort();
			}

			return groupKeys.map((key) => {
				const groupItems = grouped[key];
				const meta = metadataMap.get(key) || {};

				if (typeof strategy.sortItems === 'function') {
					groupItems.sort(strategy.sortItems);
				} else {
					groupItems.sort((a, b) => a.name.localeCompare(b.name));
				}

				return {
					id: key,
					title: meta.title || key,
					description: meta.description || null,
					order: meta.order || 999,
					type: meta.type || null,
					stats: meta.stats || null,
					items: groupItems,
				};
			});
		}

		// FLAT STRATEGY
		return [
			{
				id: 'all',
				title: null,
				items: items.sort((a, b) => a.name.localeCompare(b.name)),
			},
		];
	}, [entities, type, searchQuery, context]);
}
