// features/entity-view/WikiEntityView.jsx
import { useEntityViewModel } from '@/features/wiki/useEntityView';
import { EntityHeader } from '@/features/wiki/components/EntityHeader';
import StandardLayout from '@/features/wiki/layouts/StandardLayout';
import SessionLayout from '@/features/wiki/layouts/SessionLayout';

export default function WikiEntityView({ entity }) {
	const viewModel = useEntityViewModel(entity);

	if (!viewModel) return null;

	// Determine layout based on entity type
	let LayoutComponent;
	if (entity?.type === 'session') {
		LayoutComponent = SessionLayout;
	} else {
		LayoutComponent = StandardLayout;
	}

	return (
		<div className='pb-16 animate-in fade-in duration-300 min-h-full'>
			{/* Universal Header */}
			<EntityHeader data={viewModel.header} />

			{/* Dynamic Layout */}
			<LayoutComponent viewModel={viewModel} />
		</div>
	);
}
