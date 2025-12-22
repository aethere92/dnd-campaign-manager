/**
 * useEntityViewModel Hook (Refactored)
 * Orchestrator that combines all sub-hooks and transforms
 *
 * Previously: 250 lines of mixed logic
 * Now: 50 lines of composition
 */

import { useMemo } from 'react';
import { parseAttributes } from '../../utils/image/imageResolver';
import { isSession } from '../../utils/entity/entityHelpers';
import { transformAttributes } from './transforms/attributeTransform';
import { useEntityHeader } from './hooks/useEntityHeader';
import { useEntityContent } from './hooks/useEntityContent';
import { useEntitySidebar } from './hooks/useEntitySidebar';

/**
 * Main view model hook
 * @param {Object} entity - Raw entity data
 * @returns {Object} Complete entity view model
 */
export function useEntityViewModel(entity) {
	// 1. Parse attributes once
	const attributes = useMemo(() => {
		return parseAttributes(entity?.attributes);
	}, [entity]);

	// 2. Transform attributes into traits and sections
	const { traits, sections } = useMemo(() => {
		if (!entity) return { traits: [], sections: [] };
		return transformAttributes(attributes, entity.description);
	}, [entity, attributes]);

	// 3. Build sub-models using focused hooks
	const header = useEntityHeader(entity, attributes);
	const sidebar = useEntitySidebar(entity, traits);
	const content = useEntityContent(entity, attributes, sections);

	// 4. Determine layout mode
	const layoutMode = useMemo(() => {
		return isSession(entity) ? 'tabs' : 'standard';
	}, [entity]);

	// 5. Combine everything
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
