export const getGraphStyles = (theme) => {
	// Logic based on explicit App Theme
	const isDark = theme === 'dark';

	// Define dynamic colors
	const colors = {
		// Major Nodes
		text: isDark ? '#F3F4F6' : '#000000', // White vs Black
		textBg: isDark ? '#1F2937' : '#ffffff', // Dark Gray vs White

		// Minor Nodes
		minorText: isDark ? '#D1D5DB' : '#374151', // Light Gray vs Dark Gray
		textOutline: isDark ? '#000000' : '#ffffff', // Black halo vs White halo
	};

	return [
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

				// DYNAMIC: Text Background
				'text-background-color': colors.textBg,
				'text-background-opacity': 0.7,
				'text-background-padding': 2,
				'text-background-shape': 'roundrectangle',

				// DYNAMIC: Main Text Color
				color: colors.text,

				'text-wrap': 'ellipsis',
				'text-max-width': 100,
				'transition-property': 'opacity, width, height, color, text-background-color',
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

				// Minor nodes: No box, but use an outline (halo) to separate text from background
				'text-background-opacity': 0,

				// DYNAMIC: Halo color (Black in dark mode makes text pop)
				'text-outline-color': colors.textOutline,
				'text-outline-width': 2,
				'text-outline-opacity': 0.8,

				// DYNAMIC: Minor text color
				color: colors.minorText,
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
};

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
