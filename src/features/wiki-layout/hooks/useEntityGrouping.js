import { useMemo } from 'react';
import { GROUPING_CONFIG } from '../config/groupingConfig';
import { transformEntityToViewModel } from '../transforms/entityTransforms';

/**
 * Groups and sorts entities based on type-specific configuration
 */
export function useEntityGrouping(entities, type, searchQuery = '') {
	return useMemo(() => {
		if (!entities || entities.length === 0) return [];

		// 1. Filter by search
		const filtered = searchQuery
			? entities.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: entities;

		// 2. Transform to view model
		const items = filtered.map((entity) => transformEntityToViewModel(entity, type));

		// 3. Check for grouping strategy
		const strategy = GROUPING_CONFIG[type];

		if (!strategy) {
			// No grouping: return single group sorted by name
			return [
				{
					id: 'all',
					title: null,
					items: items.sort((a, b) => a.name.localeCompare(b.name)),
				},
			];
		}

		// 4. Apply grouping
		const grouped = {};
		items.forEach((item) => {
			const groupKey = strategy.groupBy(item);
			if (!grouped[groupKey]) grouped[groupKey] = [];
			grouped[groupKey].push(item);
		});

		// 5. Sort groups
		let groupKeys = Object.keys(grouped);

		if (typeof strategy.sortGroups === 'function') {
			groupKeys.sort(strategy.sortGroups);
		} else if (Array.isArray(strategy.sortGroups)) {
			// Custom list order
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

		// 6. Sort items within groups
		return groupKeys.map((key) => {
			const groupItems = grouped[key];

			if (typeof strategy.sortItems === 'function') {
				groupItems.sort(strategy.sortItems);
			} else {
				// Default alphabetical
				groupItems.sort((a, b) => a.name.localeCompare(b.name));
			}

			return {
				id: key,
				title: key,
				items: groupItems,
			};
		});
	}, [entities, type, searchQuery]);
}
