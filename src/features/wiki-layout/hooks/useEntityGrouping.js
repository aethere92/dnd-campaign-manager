import { useMemo } from 'react';
import { GROUPING_CONFIG } from '../config/groupingConfig';
import { transformEntityToViewModel } from '../transforms/entityTransforms';

// --- TREE BUILDER HELPER ---
const buildTree = (items, sortFn) => {
	const idMap = new Map();
	const roots = [];

	// 1. Initialize map
	items.forEach((item) => {
		idMap.set(item.id, { ...item, children: [] });
	});

	// 2. Build Hierarchy
	items.forEach((item) => {
		const node = idMap.get(item.id);
		const parentId = item.meta.parentId;

		if (parentId && idMap.has(parentId)) {
			const parent = idMap.get(parentId);
			parent.children.push(node);
		} else {
			roots.push(node);
		}
	});

	// 3. Prune Empty Folders (Recursive)
	// We want to remove 'location' nodes that have no children,
	// UNLESS we are in the Location wiki (where locations ARE the content).
	// But in NPC wiki, Locations are just containers.
	// Since we don't pass 'type' context here easily, we rely on the fact
	// that if a Location was fetched as a "container" for NPCs, it's expendable if empty.

	const prune = (nodes) => {
		// Filter out nodes that are locations AND have no children
		// But wait, if we are in Location View, we don't want to prune leaf locations.
		// Simple heuristic: If we are in 'tree' mode for NPCs, we probably have mixed types.
		// If ALL items are Locations, we shouldn't prune leaf locations.

		// Let's rely on the calling context. If we have mixed types, we prune "empty folders".
		const hasMixedTypes = items.some((i) => i.type === 'npc');

		if (!hasMixedTypes) return nodes; // Don't prune if we are just listing locations

		return nodes.filter((node) => {
			if (node.children.length > 0) {
				node.children = prune(node.children);
			}

			// If it's a location (folder) and has no children after pruning, remove it
			if (node.type === 'location' && node.children.length === 0) {
				return false;
			}
			return true;
		});
	};

	let finalRoots = prune(roots);

	// 4. Recursive Sort
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
					isTree: true,
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
