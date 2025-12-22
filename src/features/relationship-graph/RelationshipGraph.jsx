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
		// IMPLEMENTATION: Constellation Background via CSS radial-gradient
		<div
			className='h-full w-full relative bg-background overflow-hidden'
			style={{
				backgroundImage:
					'radial-gradient(circle at center, #e5e5e5 1px, transparent 1px), radial-gradient(circle at center, #e5e5e5 1px, transparent 1px)',
				backgroundSize: '40px 40px, 20px 20px',
				backgroundPosition: '0 0, 20px 20px',
			}}>
			{/* Overlay UI */}
			<GraphLegend />

			{/* The Graph Layer */}
			<CytoscapeCanvas elements={elements} />
		</div>
	);
}
