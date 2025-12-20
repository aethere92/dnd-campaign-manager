import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEntities } from '../../services/entities';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { getEntityConfig } from '../../config/entityConfig';
import { GROUPING_CONFIG } from './config/groupingConfig';
import './types';

// Helper to extract clean string from messy JSON attributes
const getAttributeValue = (attributes, keys) => {
	if (!attributes) return null;

	for (const key of keys) {
		const val = attributes[key] || attributes[key.toLowerCase()];
		if (!val) continue;

		if (typeof val === 'string') return val;
		if (Array.isArray(val) && val[0]?.value) return val[0].value;
		if (typeof val === 'object' && val.value) return val.value;
	}
	return null;
};

export function useWikiNavigation() {
	const { campaignId } = useCampaign();
	const { type } = useParams();
	const [search, setSearch] = useState('');

	const normalizedType = type === 'sessions' ? 'session' : type;

	// 1. Resolve Config
	const entityConfig = getEntityConfig(normalizedType);
	const config = {
		label: `${entityConfig.label}s`,
		Icon: entityConfig.icon,
		textClass: entityConfig.tailwind.text,
	};

	// 2. Fetch Data
	const { data: entities, isLoading } = useQuery({
		queryKey: ['entities', campaignId, normalizedType],
		queryFn: () => getEntities(campaignId, normalizedType),
		enabled: !!campaignId && !!normalizedType,
	});

	// 3. Filter Data
	const filteredEntities = useMemo(() => {
		if (!entities) return [];
		if (!search) return entities;

		const lowerSearch = search.toLowerCase();
		return entities.filter((e) => e.name.toLowerCase().includes(lowerSearch));
	}, [entities, search]);

	// 4. Map & Group Data
	const groups = useMemo(() => {
		if (!filteredEntities) return [];

		// A. Map to View Model
		const items = filteredEntities.map((entity) => {
			const statusRaw = getAttributeValue(entity.attributes, ['status']);
			const affinityRaw = getAttributeValue(entity.attributes, ['affinity']);

			return {
				id: entity.id,
				name: entity.name,
				path: entity.id,
				type: normalizedType,
				status: statusRaw ? statusRaw.toLowerCase() : 'unknown',
				affinity: affinityRaw ? affinityRaw.toLowerCase() : 'unknown',
				attributes: entity.attributes, // Pass attributes for grouping
				relationships: entity.relationships, // Pass relationships for NPC location grouping
			};
		});

		// B. Check for Grouping Strategy
		const strategy = GROUPING_CONFIG[normalizedType];

		if (!strategy) {
			// Default: Single "All" group, sorted by name
			return [
				{
					id: 'all',
					title: null, // No header needed
					items: items.sort((a, b) => a.name.localeCompare(b.name)),
				},
			];
		}

		// C. Apply Grouping
		const grouped = {};
		items.forEach((item) => {
			const groupKey = strategy.groupBy(item);
			if (!grouped[groupKey]) grouped[groupKey] = [];
			grouped[groupKey].push(item);
		});

		// D. Sort Groups
		let groupKeys = Object.keys(grouped);
		if (Array.isArray(strategy.sortGroups)) {
			// Custom order (e.g., Ally -> Neutral -> Enemy)
			groupKeys.sort((a, b) => {
				const idxA = strategy.sortGroups.indexOf(a);
				const idxB = strategy.sortGroups.indexOf(b);
				// If not found in custom list, push to end
				const valA = idxA === -1 ? 999 : idxA;
				const valB = idxB === -1 ? 999 : idxB;
				return valA - valB || a.localeCompare(b);
			});
		} else if (strategy.sortGroups === 'alpha') {
			groupKeys.sort();
		}

		// E. Sort Items inside Groups & Return structure
		return groupKeys.map((key) => {
			const groupItems = grouped[key];

			if (typeof strategy.sortItems === 'function') {
				groupItems.sort(strategy.sortItems);
			} else {
				// Default alpha sort
				groupItems.sort((a, b) => a.name.localeCompare(b.name));
			}

			return {
				id: key,
				title: key,
				items: groupItems,
			};
		});
	}, [filteredEntities, normalizedType]);

	return {
		config,
		isLoading,
		hasItems: groups.length > 0 && groups.some((g) => g.items.length > 0),
		groups,
		search,
		setSearch,
	};
}
