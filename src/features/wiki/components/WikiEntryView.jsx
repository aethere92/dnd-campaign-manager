import { useEntityViewModel } from '@/features/wiki/useEntityView';
import { EntityHeader } from '@/features/wiki/components/EntityHeader';
import StandardLayout from '@/features/wiki/layouts/StandardLayout';
import SessionLayout from '@/features/wiki/layouts/SessionLayout';
import CharacterLayout from '@/features/wiki/layouts/CharacterLayout'; // Import New Layout

export default function WikiEntityView({ entity }) {
	const viewModel = useEntityViewModel(entity);

	if (!viewModel) return null;

	let LayoutComponent;
	if (viewModel.layoutMode === 'tabs') {
		LayoutComponent = SessionLayout;
	} else if (viewModel.layoutMode === 'character') {
		LayoutComponent = CharacterLayout;
	} else {
		LayoutComponent = StandardLayout;
	}

	return (
		<div className='pb-16 animate-in fade-in duration-300 min-h-full'>
			<EntityHeader data={viewModel.header} />
			<LayoutComponent viewModel={viewModel} />
		</div>
	);
}
