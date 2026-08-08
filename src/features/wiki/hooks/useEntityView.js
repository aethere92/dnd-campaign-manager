import { useMemo } from 'react';
import { parseAttributes } from '@/domain/entity/utils/attributeParser';
import { transformAttributes } from '@/features/wiki/utils/attributeMapper';
import { useEntityHeader } from '@/features/wiki/hooks/useEntityHeader';
import { useEntityContent } from '@/features/wiki/hooks/useEntityContent';
import { useEntitySidebar } from '@/features/wiki/hooks/useEntitySidebar';

export function useEntityView(entity) {
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
