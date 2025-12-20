import { ENTITY_CONFIG } from '../../../config/entityConfig'; // Adjust path

export const GraphLegend = () => {
	// Filter out the 'default' config to keep legend clean
	const legendItems = Object.values(ENTITY_CONFIG).filter((c) => c.label !== 'Entity');

	return (
		<div className='absolute top-4 left-4 z-10 bg-background/90 p-3 rounded shadow border border-border backdrop-blur pointer-events-none select-none'>
			<h2 className='text-xs font-bold uppercase text-gray-400 mb-2'>Legend</h2>
			<div className='space-y-1.5'>
				{legendItems.map((config) => (
					<div key={config.label} className='flex items-center gap-2 text-xs font-medium text-gray-600'>
						<div className='w-2.5 h-2.5 rounded-full shadow-sm' style={{ backgroundColor: config.color }} />
						{config.label}
					</div>
				))}
			</div>
		</div>
	);
};
