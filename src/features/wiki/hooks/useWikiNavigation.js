import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { useEntityFetching } from '@/features/wiki/hooks/useEntityFetching';
import { useEntityGrouping } from '@/features/wiki/hooks/useEntityGrouping';
import { normalizeTypeParam } from '@/domain/entity/utils/entityUtils';

export function useWikiNavigation() {
	const { type } = useParams();
	const [search, setSearch] = useState('');

	const normalizedType = normalizeTypeParam(type);

	// 1. Fetch entities AND context (Arcs, Relationships)
	const { entities, context, isLoading } = useEntityFetching(normalizedType);

	// 2. Group and filter entities
	const groups = useEntityGrouping(entities, normalizedType, search, context);

	// 3. Build UI config
	const entityConfig = getEntityConfig(normalizedType);

	// Guard clause in case config isn't found (e.g. invalid URL)
	if (!entityConfig) {
		return { isLoading: true, groups: [], config: { label: 'Loading...', textClass: '' } };
	}

	const config = {
		label: `${entityConfig.label}s`,
		Icon: entityConfig.icon,
		textClass: entityConfig.tailwind.text,
	};

	return {
		config,
		isLoading,
		hasItems: groups.length > 0 && groups.some((g) => g.items.length > 0),
		groups,
		search,
		setSearch,
	};
}
