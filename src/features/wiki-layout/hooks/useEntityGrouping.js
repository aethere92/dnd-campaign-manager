import { useMemo } from 'react';
import { GROUPING_CONFIG } from '../config/groupingConfig';
import { transformEntityToViewModel } from '../transforms/entityTransforms';

// --- TREE BUILDER HELPER ---
const buildTree = (items, sortFn) => {
	const idMap = new Map();
	const roots = [];

	// 1. Initialize map
	items.forEach((item) => {
		// Shallow clone to attach children
		idMap.set(item.id, { ...item, children: [] });
	});

	// 2. Build Hierarchy
	items.forEach((item) => {
		const node = idMap.get(item.id);
		const parentId = item.meta.parentId;

		// If has parent and parent exists in this list (safety check)
		if (parentId && idMap.has(parentId)) {
			const parent = idMap.get(parentId);
			parent.children.push(node);
		} else {
			// Is a root node
			roots.push(node);
		}
	});

	// 3. Recursive Sort
	const sortRecursive = (nodes) => {
		if (sortFn) nodes.sort(sortFn);
		nodes.forEach((node) => {
			if (node.children.length > 0) {
				sortRecursive(node.children);
			}
		});
	};

	sortRecursive(roots);
	return roots;
};

export function useEntityGrouping(entities, type, searchQuery = '') {
	return useMemo(() => {
		if (!entities || entities.length === 0) return [];

		// 1. Filter by search
		const filtered = searchQuery
			? entities.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: entities;

		// 2. Transform to view model
		const items = filtered.map((entity) => transformEntityToViewModel(entity, type));

		const strategy = GROUPING_CONFIG[type];

		// --- STRATEGY 1: TREE (Nested) ---
		if (strategy?.mode === 'tree') {
			const treeRoots = buildTree(items, strategy.sortItems);
			return [
				{
					id: 'root',
					title: null,
					items: treeRoots,
					isTree: true, // Signal to renderer
				},
			];
		}

		// --- STRATEGY 2: GROUPED (Flat Categories) ---
		if (strategy && strategy.groupBy) {
			const grouped = {};
			items.forEach((item) => {
				const groupKey = strategy.groupBy(item) || 'Other';
				if (!grouped[groupKey]) grouped[groupKey] = [];
				grouped[groupKey].push(item);
			});

			let groupKeys = Object.keys(grouped);

			if (typeof strategy.sortGroups === 'function') {
				groupKeys.sort(strategy.sortGroups);
			} else if (Array.isArray(strategy.sortGroups)) {
				groupKeys.sort((a, b) => {
					const idxA = strategy.sortGroups.indexOf(a);
					const idxB = strategy.sortGroups.indexOf(b);
					const valA = idxA === -1 ? 999 : idxA;
					const valB = idxB === -1 ? 999 : idxB;
					return valA - valB || a.localeCompare(b);
				});
			} else if (strategy.sortGroups === 'alpha') {
				groupKeys.sort();
			}

			return groupKeys.map((key) => {
				const groupItems = grouped[key];
				if (typeof strategy.sortItems === 'function') {
					groupItems.sort(strategy.sortItems);
				} else {
					groupItems.sort((a, b) => a.name.localeCompare(b.name));
				}
				return {
					id: key,
					title: key,
					items: groupItems,
				};
			});
		}

		// --- STRATEGY 3: DEFAULT (Flat A-Z) ---
		return [
			{
				id: 'all',
				title: null,
				items: items.sort((a, b) => a.name.localeCompare(b.name)),
			},
		];
	}, [entities, type, searchQuery]);
}
