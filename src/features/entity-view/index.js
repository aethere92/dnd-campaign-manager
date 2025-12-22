/**
 * Entity View Module Exports
 * Centralized exports for entity view feature
 */

// Main view model hook
export { useEntityViewModel } from './useEntityViewModel';

// Sub-hooks (if needed directly)
export { useEntityHeader } from './hooks/useEntityHeader';
export { useEntityContent } from './hooks/useEntityContent';
export { useEntitySidebar } from './hooks/useEntitySidebar';

// Transform functions (if needed directly)
export { transformAttributes, extractHeaderTags } from './transforms/attributeTransform';
export { transformRelationships } from './transforms/relationshipTransform';
export { transformEvents } from './transforms/eventTransform';

// Layouts
export { StandardLayout, SessionLayout } from './layouts';

// Components
export { default as WikiEntityView } from './WikiEntityView';
export { EntityHeader } from './components/EntityHeader';
export { EntityBody, EntityHistory } from './components/EntityBody';
export { EntitySidebar } from './components/EntitySidebar';
