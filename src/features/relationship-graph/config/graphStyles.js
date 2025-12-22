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
			'font-size': 14,
			'font-weight': 'bold',
			'text-valign': 'bottom',
			'text-margin-y': 6,
			'text-background-color': '#fdfbf7',
			'text-background-opacity': 0.8,
			'text-background-padding': 3,
			'text-background-shape': 'roundrectangle',
			color: '#1f2937',
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
			// ADJUSTED: Increased from 14 to 20 for better visibility
			width: 20,
			height: 20,
			// 'background-image': 'none', // Hide Icon
			'background-color': 'data(color)', // Use entity color as fill
			'border-width': 1,
			'border-color': 'data(color)',
			'font-size': 10,
			'text-margin-y': 4,
			'text-background-opacity': 0, // No background for text to reduce clutter
			color: '#4b5563', // Gray text
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
			opacity: 0.2, // Slightly more transparent to handle overlap
			'arrow-scale': 0.6,
			'target-arrow-shape': 'triangle',
		},
	},
	// --- INTERACTION STATES ---
	{
		selector: '.dimmed',
		style: {
			opacity: 0.2,
			'text-opacity': 0.1,
			'border-opacity': 0.1,
			'background-opacity': 0.1,
		},
	},
	{
		selector: '.highlighted',
		style: {
			'z-index': 9999,
			'overlay-color': '#d97706', // Amber glow
			'overlay-padding': 2,
			'overlay-opacity': 0.2,
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

// PERFORMANCE: Switch to fCoSE layout
export const LAYOUT_CONFIG = {
	name: 'fcose',
	quality: 'default',
	randomize: false,
	animate: true,
	animationDuration: 1000,
	fit: true,
	padding: 50,
	nodeDimensionsIncludeLabels: true,
	// Physics settings - INCREASED SPACING
	nodeRepulsion: (node) => 20000 * (node.data('degree') || 1), // Stronger repulsion
	idealEdgeLength: (edge) => 300, // Longer edges
	edgeElasticity: (edge) => 0.45,
	nestingFactor: 0.1,
	gravity: 0.8,
	numIter: 2500,
	tile: true,
	tilingPaddingVertical: 20,
	tilingPaddingHorizontal: 20,
};
