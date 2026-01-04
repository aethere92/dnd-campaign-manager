import { useMemo } from 'react';
import { parseAttributes } from '@/shared/utils/imageUtils';
import { transformAttributes } from '@/features/wiki/utils/attributeMapper';
import { useEntityHeader } from './hooks/useEntityHeader';
import { useEntityContent } from './hooks/useEntityContent';
import { useEntitySidebar } from './hooks/useEntitySidebar';

export function useEntityViewModel(entity) {
	const attributes = useMemo(() => {
		return parseAttributes(entity?.attributes);
	}, [entity]);

	const { traits, sections } = useMemo(() => {
		if (!entity) return { traits: [], sections: [] };
		return transformAttributes(attributes, entity.description);
	}, [entity, attributes]);

	const header = useEntityHeader(entity, attributes);
	const sidebar = useEntitySidebar(entity, traits);
	const content = useEntityContent(entity, attributes, sections);

	const layoutMode = useMemo(() => {
		if (entity?.type === 'session') return 'tabs';
		if (entity?.type === 'character') return 'character';
		return 'standard';
	}, [entity]);

	return useMemo(() => {
		if (!entity) return null;

		return {
			layoutMode,
			header,
			sidebar,
			content,
			raw: { ...entity, attributes },
		};
	}, [entity, layoutMode, header, sidebar, content, attributes]);
}
