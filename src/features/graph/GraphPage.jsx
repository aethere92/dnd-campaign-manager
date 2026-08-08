import { useGraph } from '@/features/graph/hooks/useGraph';
import { GraphLegend } from './components/GraphLegend';
import { CytoscapeCanvas } from './components/CytoscapeCanvas';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

export default function GraphPage() {
	const { elements, isLoading } = useGraph();

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center'>
				<LoadingSpinner text='Analyzing Connections...' />
			</div>
		);
	}

	return (
		<div className='h-full w-full relative overflow-hidden bg-dot-grid'>
			{/* Overlay UI */}
			<GraphLegend />

			{/* The Graph Layer */}
			<CytoscapeCanvas elements={elements} />
		</div>
	);
}
