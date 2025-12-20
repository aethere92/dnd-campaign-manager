import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGraphData } from '../../services/entities';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { getEntityConfig } from '../../config/entityConfig';
import './types';

const ICON_BASE_PATH = 'images/icons';

// Helper: Resolve Icon URL
const resolveIcon = (specificIcon, entityType) => {
	if (specificIcon) {
		if (specificIcon.includes('/') || specificIcon.startsWith('http')) return specificIcon;
		const fileName = specificIcon.endsWith('.png') ? specificIcon : `${specificIcon}.png`;
		return `${ICON_BASE_PATH}/${fileName}`;
	}
	// Fallback to generic type icon
	return `${ICON_BASE_PATH}/${entityType || 'unknown'}.png`;
};

// Helper: Get raw image string from attributes
const getRawAttributeImage = (attributes) => {
	if (!attributes) return null;
	const keys = ['Image', 'Portrait', 'Icon', 'image', 'portrait', 'icon'];
	for (const key of keys) {
		const val = attributes[key];
		if (!val) continue;
		if (Array.isArray(val) && val[0]?.value) return val[0].value;
		if (typeof val === 'string') return val;
	}
	return null;
};

/**
 * @returns {{ elements: import('./types').CytoscapeElement[], isLoading: boolean }}
 */
export function useGraphViewModel() {
	const { campaignId } = useCampaign();

	// 1. Fetch Data
	const { data: entities, isLoading } = useQuery({
		queryKey: ['graph', campaignId],
		queryFn: () => getGraphData(campaignId),
		enabled: !!campaignId,
	});

	// 2. Transform Data
	const elements = useMemo(() => {
		if (!entities || entities.length === 0) return [];

		const nodes = [];
		const edges = [];

		// Sets for filtering and uniqueness
		const entityIds = new Set(entities.map((e) => e.id));
		const connectedNodeIds = new Set();
		const uniqueEdgeTracker = new Set();
		const relIcons = new Map();

		// Pre-pass: Collect custom relationship icons
		entities.forEach((source) => {
			(source.relationships || []).forEach((rel) => {
				if (rel.icon) relIcons.set(rel.entity_id, rel.icon);
			});
		});

		// Pass 1: Generate Edges first to determine connectivity
		entities.forEach((entity) => {
			(entity.relationships || []).forEach((rel) => {
				if (!entityIds.has(rel.entity_id)) return;

				// Unique Edge Logic: Sort IDs to treat A->B and B->A as the same connection
				const [id1, id2] = [entity.id, rel.entity_id].sort();
				const edgeKey = `${id1}-${id2}`;

				if (uniqueEdgeTracker.has(edgeKey)) return; // Skip if connection exists
				uniqueEdgeTracker.add(edgeKey);

				// Mark nodes as connected
				connectedNodeIds.add(entity.id);
				connectedNodeIds.add(rel.entity_id);

				let edgeColor = '#aaa'; // gray-200
				const t = rel.type?.toLowerCase() || '';
				if (t.includes('enemy') || t.includes('rival')) edgeColor = '#f44336'; // red
				else if (t.includes('ally') || t.includes('friend')) edgeColor = '#22c55e'; // green

				edges.push({
					group: 'edges',
					data: {
						id: `e-${edgeKey}`,
						source: entity.id,
						target: rel.entity_id,
						// label: rel.type, // Removed from data payload as it's not needed for display anymore
						color: edgeColor,
					},
				});
			});
		});

		// Pass 2: Generate Nodes (Only if they are connected)
		entities.forEach((entity) => {
			// FILTER: If node is not in our connected set, skip it
			if (!connectedNodeIds.has(entity.id)) return;

			const config = getEntityConfig(entity.type);
			const rawIcon = relIcons.get(entity.id) || getRawAttributeImage(entity.attributes);
			const finalIconUrl = resolveIcon(rawIcon, entity.type);

			nodes.push({
				group: 'nodes',
				data: {
					id: entity.id,
					label: entity.name,
					color: config.color,
					image: finalIconUrl,
					type: entity.type,
				},
			});
		});

		return [...nodes, ...edges];
	}, [entities]);

	return { elements, isLoading };
}
