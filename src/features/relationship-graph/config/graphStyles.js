export const CYTOSCAPE_STYLES = [
	{
		selector: 'node',
		style: {
			label: 'data(label)',
			'border-color': 'data(color)',
			'background-image': 'data(image)',
			'background-fit': 'cover',
			'border-width': 3,
			width: 60,
			height: 60,
			'font-family': 'Inter, sans-serif',
			'font-size': 12,
			'text-valign': 'bottom',
			'text-margin-y': 8,
			'text-background-color': '#ffffff',
			'text-background-opacity': 0.7,
			'text-background-padding': 2,
			'text-background-shape': 'roundrectangle',
			color: '#1f2937', // gray-800
			'transition-property': 'opacity',
			'transition-duration': '0.3s',
		},
	},
	{
		selector: 'edge',
		style: {
			'line-color': 'data(color)',
			'target-arrow-color': 'data(color)',
			'target-arrow-shape': 'triangle',
			width: 2,
			'curve-style': 'bezier',
			'arrow-scale': 1.2,
			opacity: 0.6,
			'transition-property': 'opacity, width',
			'transition-duration': '0.3s',
		},
	},
	// --- INTERACTION STATES ---
	{
		selector: '.dimmed',
		style: {
			opacity: 0.1, // Fades out unconnected elements
			'text-opacity': 0.1,
			'border-opacity': 0.1,
		},
	},
	{
		selector: '.highlighted',
		style: {
			opacity: 1,
			'z-index': 9999,
		},
	},
	{
		selector: 'edge.highlighted',
		style: {
			width: 4, // Thicker line for highlighted connections
			opacity: 1,
		},
	},
	{
		selector: 'node.highlighted',
		style: {
			'border-width': 5, // Thicker border for highlighted nodes
			'overlay-opacity': 0,
		},
	},
];

export const LAYOUT_CONFIG = {
	name: 'cose',
	animate: false,
	nodeDimensionsIncludeLabels: true,
	padding: 50,
	componentSpacing: 100,
	nodeRepulsion: (node) => 20000,
	idealEdgeLength: (edge) => 200,
	edgeElasticity: (edge) => 100,
	nestingFactor: 5,
};
