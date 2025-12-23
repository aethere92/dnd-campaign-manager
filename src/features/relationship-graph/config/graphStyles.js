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

// PERFORMANCE: Switch to fCoSE layout with "High Spacing" profile
export const LAYOUT_CONFIG = {
	name: 'fcose',
	quality: 'default',
	randomize: false,
	animate: true,
	animationDuration: 1000,
	fit: true,
	padding: 50,

	// CRITICAL: Tells the physics engine to treat the node as "Icon + Text Label" size
	// instead of just "Icon" size.
	nodeDimensionsIncludeLabels: true,

	// --- PHYSICS SETTINGS (Aggressive Spacing) ---

	// 1. REPULSION (The "Personal Space" Force)
	// Drastically increased. This ensures that even if two nodes are connected,
	// the text labels push against each other to prevent overlap.
	nodeRepulsion: (node) => {
		const degree = node.data('degree') || 0;
		// Base: 40,000 (was 6,500)
		// Per Connection: 5,000 (was 1,500)
		return 40000 + degree * 5000;
	},

	// 2. EDGE LENGTH (The "Leash" Length)
	// Increased to ensure hubs with many connections have a wider circumference.
	idealEdgeLength: (edge) => {
		const d1 = edge.source().data('degree') || 0;
		const d2 = edge.target().data('degree') || 0;
		const maxDegree = Math.max(d1, d2);

		// Base: 150 (was 100)
		// Per Degree: 30 (was 15)
		return 150 + maxDegree * 30;
	},

	// 3. ELASTICITY
	// Lower = Stretcher edges. Allows Repulsion to win over Edge Length.
	edgeElasticity: (edge) => 0.1,

	// 4. GRAVITY (The "Centering" Force)
	// Lowered significantly. This stops the graph from collapsing on itself.
	gravity: 0.5, // (was 0.25)
	gravityRange: 3.8,

	// 5. ITERATIONS
	// More time for the simulation to resolve collisions
	numIter: 5000,

	// Disconnected components spacing
	tile: true,
	tilingPaddingVertical: 100,
	tilingPaddingHorizontal: 100,
};
