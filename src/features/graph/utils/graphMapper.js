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

	const entities = rawEntities.filter((e) => {
		const type = e.type?.toLowerCase();
		return type !== 'session_event' && type !== 'event';
	});

	const nodes = [];
	const edges = [];
	const entityIds = new Set(entities.map((e) => e.id));
	const connectedNodeIds = new Set();
	const uniqueEdgeTracker = new Set();
	const degreeMap = new Map();

	// Pass 1: Edges
	entities.forEach((entity) => {
		(entity.relationships || []).forEach((rel) => {
			if (!entityIds.has(rel.entity_id)) return;

			const [id1, id2] = [entity.id, rel.entity_id].sort();
			const edgeKey = `${id1}-${id2}`;

			if (uniqueEdgeTracker.has(edgeKey)) return;
			uniqueEdgeTracker.add(edgeKey);

			connectedNodeIds.add(entity.id);
			connectedNodeIds.add(rel.entity_id);

			degreeMap.set(entity.id, (degreeMap.get(entity.id) || 0) + 1);
			degreeMap.set(rel.entity_id, (degreeMap.get(rel.entity_id) || 0) + 1);

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

	// Pass 2: Nodes
	entities.forEach((entity) => {
		if (!connectedNodeIds.has(entity.id)) return;

		const config = getEntityConfig(entity.type);
		const finalIconUrl = resolveImageUrl(entity.attributes, 'icon') || `${FALLBACK_ICON_PATH}/${entity.type}.png`;
		const degree = degreeMap.get(entity.id) || 1;
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
				degree: degree,
			},
		});
	});

	return [...nodes, ...edges];
};
