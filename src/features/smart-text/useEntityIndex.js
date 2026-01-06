import { useQuery } from '@tanstack/react-query';
import { getEntityIndex } from '@/domain/entity/api/entityService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import { getParentId } from '@/domain/entity/utils/entityUtils';

export function useEntityIndex() {
	const { campaignId } = useCampaign();

	const { data } = useQuery({
		queryKey: ['entityIndex', campaignId],
		queryFn: async () => {
			const rawData = await getEntityIndex(campaignId);

			const list = [];
			const map = new Map();
			const searchTokens = [];

			rawData.forEach((entity) => {
				const attrs = parseAttributes(entity.attributes);

				const lightEntity = {
					...entity,
					parentId: getParentId(entity),
					iconUrl: resolveImageUrl(attrs, 'icon'),
					attributes: attrs,
				};

				// 1. Add Primary Name
				if (entity.name && entity.name.length > 2) {
					searchTokens.push({
						term: entity.name,
						entityId: entity.id,
						type: entity.type,
					});
				}

				// 2. Add Aliases
				if (attrs.aliases) {
					// Handle Array or String
					const aliasList = Array.isArray(attrs.aliases)
						? attrs.aliases
						: typeof attrs.aliases === 'string'
						? attrs.aliases.split(',').map((s) => s.trim())
						: [];

					aliasList.forEach((alias) => {
						if (alias && alias.length > 2) {
							searchTokens.push({
								term: alias,
								entityId: entity.id,
								type: entity.type,
							});
						}
					});
				}

				list.push(lightEntity);
				map.set(entity.id, lightEntity);
			});

			// Sort by length DESC so "Captain Soranna" matches before "Soranna"
			searchTokens.sort((a, b) => b.term.length - a.term.length);

			return { list, map, searchTokens };
		},
		staleTime: 1000 * 60 * 30,
		enabled: !!campaignId,
	});

	return data || { list: [], map: new Map(), searchTokens: [] };
}
