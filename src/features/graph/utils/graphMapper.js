import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { getAffinityRank } from '@/domain/entity/utils/statusUtils';

const INK_COLORS = {
	ALLY: '#4d7c0f',
	ENEMY: '#7f1d1d',
	NEUTRAL: '#78716c',
};

const FALLBACK_ICON_PATH = 'images/icons';

export const transformGraphData = (rawEntities) => {
	if (!rawEntities || rawEntities.length === 0) return [];

	const entities = rawEntities;

	const nodes = [];
	const edges = [];
	const entityIds = new Set(entities.map((e) => e.id));
	const uniqueEdgeTracker = new Set();

	// FIX: Re-introduce client-side degree calculation
	// We must count ONLY the edges that actually appear in the graph
	// to ensure the layout physics work correctly.
	const visualDegreeMap = new Map();
	const connectedNodeIds = new Set();

	// Pass 1: Edges & Degree Calculation
	entities.forEach((entity) => {
		(entity.relationships || []).forEach((rel) => {
			// Ensure target exists in our visible dataset
			if (!entityIds.has(rel.target)) return;

			// Sort IDs to treat A->B and B->A as the same visual edge
			const [id1, id2] = [entity.id, rel.target].sort();
			const edgeKey = `${id1}-${id2}`;

			if (uniqueEdgeTracker.has(edgeKey)) return;
			uniqueEdgeTracker.add(edgeKey);

			// Track connections
			connectedNodeIds.add(entity.id);
			connectedNodeIds.add(rel.target);

			// Increment Visual Degree
			visualDegreeMap.set(entity.id, (visualDegreeMap.get(entity.id) || 0) + 1);
			visualDegreeMap.set(rel.target, (visualDegreeMap.get(rel.target) || 0) + 1);

			// Determine Color
			const rank = getAffinityRank(rel.type);
			let edgeColor = INK_COLORS.NEUTRAL;
			if (rank === 1) edgeColor = INK_COLORS.ALLY;
			if (rank === 3) edgeColor = INK_COLORS.ENEMY;

			edges.push({
				group: 'edges',
				data: {
					id: `e-${edgeKey}`,
					source: entity.id,
					target: rel.target,
					color: edgeColor,
				},
			});
		});
	});

	// Pass 2: Nodes
	entities.forEach((entity) => {
		// Filter orphans: Only show if connected OR if it's a major hub
		// (Using the new visual degree for this check)
		const degree = visualDegreeMap.get(entity.id) || 0;
		if (degree === 0) return;

		const config = getEntityConfig(entity.type);

		// Use pre-fetched icon string via compatibility wrapper
		const mockAttributes = { icon: entity.icon };
		const finalIconUrl = resolveImageUrl(mockAttributes, 'icon') || `${FALLBACK_ICON_PATH}/${entity.type}.webp`;

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
				// FIX: Pass the VISUAL degree, not the DB degree
				degree: degree,
			},
		});
	});

	return [...nodes, ...edges];
};
