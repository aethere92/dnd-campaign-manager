import { useGraphViewModel } from './useGraphViewModel';
import { GraphLegend } from './components/GraphLegend';
import { CytoscapeCanvas } from './components/CytoscapeCanvas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function RelationshipGraph() {
	const { elements, isLoading } = useGraphViewModel();

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center'>
				<LoadingSpinner text='Analyzing Connections...' />
			</div>
		);
	}

	return (
		// CHANGED: 'bg-muted' -> 'bg-background' to inherit the D&D texture
		<div className='h-full w-full relative bg-background overflow-hidden'>
			{/* Overlay UI */}
			<GraphLegend />

			{/* The Graph Layer */}
			<CytoscapeCanvas elements={elements} />
		</div>
	);
}
