import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { CYTOSCAPE_STYLES, LAYOUT_CONFIG } from '../config/graphStyles';

export const CytoscapeCanvas = ({ elements }) => {
	const containerRef = useRef(null);
	const cyRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// 1. Initialize Cytoscape
		cyRef.current = cytoscape({
			container: containerRef.current,
			elements: [],
			style: CYTOSCAPE_STYLES,
			layout: LAYOUT_CONFIG,
			wheelSensitivity: 0.6,
			minZoom: 0.2,
			maxZoom: 3,
			autoungrabify: true, // Prevent moving
		});

		const cy = cyRef.current;

		// --- EVENT HANDLERS ---

		// 1. Click Node: Highlight Connections
		cy.on('tap', 'node', (evt) => {
			const node = evt.target;

			// Clear previous states
			cy.elements().removeClass('highlighted dimmed');

			// Get connections
			const connectedEdges = node.connectedEdges();
			const connectedNodes = connectedEdges.connectedNodes();

			// Dim everything that isn't connected to this node
			// logic: (All Elements) - (Node + Neighbors + Connecting Edges) -> Add Class Dimmed
			cy.elements().difference(connectedNodes.union(connectedEdges).union(node)).addClass('dimmed');

			// Highlight specific elements
			node.addClass('highlighted');
			connectedNodes.addClass('highlighted');
			connectedEdges.addClass('highlighted');
		});

		// 2. Click Background: Reset View
		cy.on('tap', (evt) => {
			if (evt.target === cy) {
				cy.elements().removeClass('highlighted dimmed');
			}
		});

		// Cleanup
		return () => {
			if (cyRef.current) {
				cyRef.current.destroy();
				cyRef.current = null;
			}
		};
	}, []);

	// 2. Handle Data Updates
	useEffect(() => {
		if (!cyRef.current || !elements) return;

		const cy = cyRef.current;

		cy.batch(() => {
			cy.elements().remove();
			cy.add(elements);
		});

		if (elements.length > 0) {
			cy.layout(LAYOUT_CONFIG).run();
			cy.fit(elements, 50);
		}
	}, [elements]);

	return <div ref={containerRef} className='absolute inset-0 w-full h-full' />;
};
