export const CYTOSCAPE_STYLES = [
	// --- MAJOR NODES (Hubs/VIPs) ---
	{
		selector: 'node',
		style: {
			label: 'data(label)',
			'border-color': 'data(color)',
			'background-image': 'data(image)',
			'background-fit': 'cover',
			'border-width': 2,
			width: 'mapData(degree, 3, 20, 30, 50)',
			height: 'mapData(degree, 3, 20, 30, 50)',
			'font-family': 'Inter, sans-serif',
			'font-size': '10pt',
			'font-weight': '500',
			'text-valign': 'bottom',
			'text-margin-y': 6,
			'letter-spacing': 0,

			// FIX: Hardcode robust colors that work on both backgrounds
			// Using a semi-transparent white background for text ensures readability
			// on both the Dark Mode stars and the Parchment texture.
			'text-background-color': '#ffffff',
			'text-background-opacity': 0.7,
			'text-background-padding': 2,
			'text-background-shape': 'roundrectangle',

			// Dark text is readable against the white text-background
			color: '#000000',

			'text-wrap': 'ellipsis',
			'text-max-width': 100,
			'transition-property': 'opacity, width, height',
			'transition-duration': '0.3s',
		},
	},
	// --- MINOR NODES (Dots) ---
	{
		selector: 'node.minor',
		style: {
			width: 20,
			height: 20,
			'background-color': 'data(color)',
			'border-width': 1,
			'border-color': 'data(color)',
			'font-size': 10,
			'text-margin-y': 4,

			// Minor nodes: clear text with white outline (halo)
			// This is cleaner than a box for small items
			'text-background-opacity': 0,
			'text-outline-color': '#ffffff',
			'text-outline-width': 2,
			'text-outline-opacity': 0.8,
			color: '#374151', // Gray-700
		},
	},
	// --- EDGES ---
	{
		selector: 'edge',
		style: {
			'line-color': 'data(color)',
			'target-arrow-color': 'data(color)',
			'curve-style': 'bezier',
			width: 1,
			opacity: 0.3,
			'arrow-scale': 0.6,
			'target-arrow-shape': 'triangle',
			events: 'no',
		},
	},
	// --- INTERACTION STATES ---
	{
		selector: '.dimmed',
		style: {
			opacity: 0.05,
			'text-opacity': 0.1,
			'border-opacity': 0.1,
			'background-opacity': 0.1,
		},
	},
	{
		selector: '.highlighted',
		style: {
			'z-index': 9999,
			'text-wrap': 'wrap',
		},
	},
	{
		selector: 'edge.highlighted',
		style: {
			width: 2,
			opacity: 1,
		},
	},
];

export const LAYOUT_CONFIG = {
	name: 'fcose',
	quality: 'default',
	randomize: false,
	animate: false,
	animationDuration: 1000,
	fit: true,
	padding: 50,
	nodeDimensionsIncludeLabels: true,
	nodeRepulsion: (node) => {
		const degree = node.data('degree') || 0;
		return 40000 + degree * 5000;
	},
	idealEdgeLength: (edge) => {
		const d1 = edge.source().data('degree') || 0;
		const d2 = edge.target().data('degree') || 0;
		const maxDegree = Math.max(d1, d2);
		return 150 + maxDegree * 30;
	},
	edgeElasticity: (edge) => 0.1,
	gravity: 0.25,
	gravityRange: 3.8,
	numIter: 2500,
	tile: true,
	tilingPaddingVertical: 100,
	tilingPaddingHorizontal: 100,
};
