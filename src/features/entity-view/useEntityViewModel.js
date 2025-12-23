import { useMemo } from 'react';
import { parseAttributes } from '../../utils/image/imageResolver'; // Use the safe parser
import { transformAttributes } from './transforms/attributeTransform';
import { useEntityHeader } from './hooks/useEntityHeader';
import { useEntityContent } from './hooks/useEntityContent';
import { useEntitySidebar } from './hooks/useEntitySidebar';

export function useEntityViewModel(entity) {
	// 1. Prepare Attributes
	// Optimization: parseAttributes now just returns the object if it's already an object.
	// This allows this hook to work with both Raw Service data and Transformed View data.
	const attributes = useMemo(() => {
		return parseAttributes(entity?.attributes);
	}, [entity]);

	// 2. Transform attributes into traits and sections
	const { traits, sections } = useMemo(() => {
		if (!entity) return { traits: [], sections: [] };
		// Pass description to avoid duplicating it in attributes list
		return transformAttributes(attributes, entity.description);
	}, [entity, attributes]);

	// 3. Build sub-models
	// We pass the full entity because it might contain pre-calculated props (like 'objectives' or 'events')
	// from the transform layer that the sub-hooks need.
	const header = useEntityHeader(entity, attributes);
	const sidebar = useEntitySidebar(entity, traits);
	const content = useEntityContent(entity, attributes, sections);

	// 4. Determine layout mode
	const layoutMode = useMemo(() => {
		// Safe check for session type
		return entity?.type === 'session' ? 'tabs' : 'standard';
	}, [entity]);

	return useMemo(() => {
		if (!entity) return null;

		return {
			layoutMode,
			header,
			sidebar,
			content,
		};
	}, [entity, layoutMode, header, sidebar, content]);
}
