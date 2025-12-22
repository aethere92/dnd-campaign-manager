/**
 * WikiEntityView Component (Refactored v3)
 * Main entity display component - now just header + layout selection
 *
 * Previously: 120 lines with embedded layout logic
 * Now: 30 lines of composition
 */

import { useEntityViewModel } from './useEntityViewModel';
import { EntityHeader } from './components/EntityHeader';
import StandardLayout from './layouts/StandardLayout';
import SessionLayout from './layouts/SessionLayout';

/**
 * Main entity view component
 * @param {Object} entity - Raw entity data
 */
export default function WikiEntityView({ entity }) {
	const viewModel = useEntityViewModel(entity);

	if (!viewModel) return null;

	// Select appropriate layout based on entity type
	const LayoutComponent = viewModel.layoutMode === 'tabs' ? SessionLayout : StandardLayout;

	return (
		<div className='pb-16 animate-in fade-in duration-300 min-h-full'>
			{/* Universal Header */}
			<EntityHeader data={viewModel.header} />

			{/* Dynamic Layout */}
			<LayoutComponent viewModel={viewModel} />
		</div>
	);
}
