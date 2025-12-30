import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { useEntityFetching } from './hooks/useEntityFetching';
import { useEntityGrouping } from './hooks/useEntityGrouping';
// import './types';

export function useWikiNavigation() {
	const { type } = useParams();
	const [search, setSearch] = useState('');

	const normalizedType = type === 'sessions' ? 'session' : type;

	// 1. Fetch entities
	const { entities, isLoading } = useEntityFetching(normalizedType);

	// 2. Group and filter entities
	const groups = useEntityGrouping(entities, normalizedType, search);

	// 3. Build UI config
	const entityConfig = getEntityConfig(normalizedType);
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
