import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGraphData } from '../../services/entities';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { getEntityConfig } from '../../config/entity';
import { resolveImageUrl } from '../../utils/image/imageResolver';
import { getAffinityRank } from '../../utils/status/statusHelpers';
import './types';

const FALLBACK_ICON_PATH = 'images/icons';

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

				// Determine Color based on Relationship Rank (Ally vs Enemy)
				// Using centralized helper instead of hardcoded strings
				const rank = getAffinityRank(rel.type);
				let edgeColor = '#e5e7eb'; // default gray-200

				if (rank === 1) edgeColor = '#22c55e'; // Ally (Green)
				if (rank === 3) edgeColor = '#ef4444'; // Enemy (Red)

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
			// FILTER: If node is not in our connected set, skip it
			if (!connectedNodeIds.has(entity.id)) return;

			const config = getEntityConfig(entity.type);

			// USE CENTRALIZED UTILITY for images
			const finalIconUrl = resolveImageUrl(entity.attributes, 'icon') || `${FALLBACK_ICON_PATH}/${entity.type}.png`;

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
	}, [rawEntities]);

	return { elements, isLoading };
}
