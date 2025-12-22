import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGraphData } from '../../services/entities';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { getEntityConfig } from '../../config/entity';
import { resolveImageUrl } from '../../utils/image/imageResolver';
import { getAffinityRank } from '../../utils/status/statusHelpers';
import './types';

const FALLBACK_ICON_PATH = 'images/icons';

// --- INK THEME PALETTE ---
const INK_COLORS = {
	ALLY: '#4d7c0f', // Forest Green Ink
	ENEMY: '#7f1d1d', // Dried Blood Red
	NEUTRAL: '#78716c', // Warm Stone/Sepia
};

export function useGraphViewModel() {
	const { campaignId } = useCampaign();

	// 1. Fetch Data
	const { data: rawEntities, isLoading } = useQuery({
		queryKey: ['graph', campaignId],
		queryFn: () => getGraphData(campaignId),
		enabled: !!campaignId,
	});

	// 2. Transform Data
	const elements = useMemo(() => {
		if (!rawEntities || rawEntities.length === 0) return [];

		// --- FILTERING STEP ---
		const entities = rawEntities.filter((e) => {
			const type = e.type?.toLowerCase();
			return type !== 'session_event' && type !== 'event';
		});

		const nodes = [];
		const edges = [];

		// Sets for filtering and uniqueness
		const entityIds = new Set(entities.map((e) => e.id));
		const connectedNodeIds = new Set();
		const uniqueEdgeTracker = new Set();
		const degreeMap = new Map(); // Track connection counts

		// Pass 1: Generate Edges first to determine connectivity
		entities.forEach((entity) => {
			(entity.relationships || []).forEach((rel) => {
				// Filter: Skip if the target entity was filtered out
				if (!entityIds.has(rel.entity_id)) return;

				// Unique Edge Logic: Sort IDs to treat A->B and B->A as the same connection
				const [id1, id2] = [entity.id, rel.entity_id].sort();
				const edgeKey = `${id1}-${id2}`;

				if (uniqueEdgeTracker.has(edgeKey)) return;
				uniqueEdgeTracker.add(edgeKey);

				// Mark nodes as connected
				connectedNodeIds.add(entity.id);
				connectedNodeIds.add(rel.entity_id);

				// Increment Degrees
				degreeMap.set(entity.id, (degreeMap.get(entity.id) || 0) + 1);
				degreeMap.set(rel.entity_id, (degreeMap.get(rel.entity_id) || 0) + 1);

				// Determine Color based on Relationship Rank
				const rank = getAffinityRank(rel.type);
				let edgeColor = INK_COLORS.NEUTRAL;

				if (rank === 1) edgeColor = INK_COLORS.ALLY;
				if (rank === 3) edgeColor = INK_COLORS.ENEMY;

				edges.push({
					group: 'edges',
					data: {
						id: `e-${edgeKey}`,
						source: entity.id,
						target: rel.entity_id,
						color: edgeColor,
					},
				});
			});
		});

		// Pass 2: Generate Nodes (Only if they are connected)
		entities.forEach((entity) => {
			if (!connectedNodeIds.has(entity.id)) return;

			const config = getEntityConfig(entity.type);
			const finalIconUrl = resolveImageUrl(entity.attributes, 'icon') || `${FALLBACK_ICON_PATH}/${entity.type}.png`;
			const degree = degreeMap.get(entity.id) || 1;

			// THRESHOLD: Nodes with < 3 connections are "minor" (dots)
			const isMinor = degree < 3;

			nodes.push({
				group: 'nodes',
				classes: isMinor ? 'minor' : 'major',
				data: {
					id: entity.id,
					label: entity.name,
					color: config.color,
					image: finalIconUrl,
					type: entity.type,
					degree: degree, // For dynamic sizing
				},
			});
		});

		return [...nodes, ...edges];
	}, [rawEntities]);

	return { elements, isLoading };
}
