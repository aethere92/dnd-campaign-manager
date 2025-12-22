import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose'; // IMPLEMENTATION: fCoSE
import { CYTOSCAPE_STYLES, LAYOUT_CONFIG } from '../config/graphStyles';

// Register the layout extension
cytoscape.use(fcose);

export const CytoscapeCanvas = ({ elements }) => {
	const containerRef = useRef(null);
	const cyRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (!containerRef.current) return;

		// 1. Initialize Cytoscape
		cyRef.current = cytoscape({
			container: containerRef.current,
			elements: [],
			style: CYTOSCAPE_STYLES,
			layout: LAYOUT_CONFIG,
			wheelSensitivity: 3,
			minZoom: 0.2,
			maxZoom: 3,
			autoungrabify: false, // Allow moving nodes in fCoSE
		});

		const cy = cyRef.current;

		// --- EVENT HANDLERS ---

		// 1. Click Node: Highlight Connections
		cy.on('tap', 'node', (evt) => {
			const node = evt.target;

			// Clear previous states
			cy.elements().removeClass('highlighted dimmed');

			const connectedEdges = node.connectedEdges();
			const connectedNodes = connectedEdges.connectedNodes();

			// Dim everything else
			cy.elements().difference(connectedNodes.union(connectedEdges).union(node)).addClass('dimmed');

			// Highlight selection
			node.addClass('highlighted');
			connectedNodes.addClass('highlighted');
			connectedEdges.addClass('highlighted');
		});

		// 2. Click Background: Reset
		cy.on('tap', (evt) => {
			if (evt.target === cy) {
				cy.elements().removeClass('highlighted dimmed');
			}
		});

		// 3. IMPLEMENTATION: Double Click to Navigate
		cy.on('dblclick', 'node', (evt) => {
			const node = evt.target;
			const { id, type } = node.data();
			if (id && type) {
				navigate(`/wiki/${type}/${id}`);
			}
		});

		return () => {
			if (cyRef.current) {
				cyRef.current.destroy();
				cyRef.current = null;
			}
		};
	}, [navigate]);

	// 2. Handle Data Updates
	useEffect(() => {
		if (!cyRef.current || !elements) return;

		const cy = cyRef.current;

		cy.batch(() => {
			cy.elements().remove();
			cy.add(elements);
		});

		if (elements.length > 0) {
			// Run fCoSE layout
			cy.layout(LAYOUT_CONFIG).run();
		}
	}, [elements]);

	return <div ref={containerRef} className='absolute inset-0 w-full h-full' />;
};
