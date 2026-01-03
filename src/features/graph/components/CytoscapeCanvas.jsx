import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { useTheme } from '@/shared/hooks/useTheme';
import { getGraphStyles, LAYOUT_CONFIG } from '@/features/graph/config/graphStyles';

// Register the layout extension
cytoscape.use(fcose);

export const CytoscapeCanvas = ({ elements }) => {
	const containerRef = useRef(null);
	const cyRef = useRef(null);
	const navigate = useNavigate();

	// 1. Get the theme from the hook
	const { theme } = useTheme();

	// 2. Memoize styles based on theme
	const styles = useMemo(() => {
		return getGraphStyles(theme);
	}, [theme]);

	// FIX: Live Style Update Effect
	// This watches for changes to the 'styles' object and injects them into the active graph
	useEffect(() => {
		if (cyRef.current) {
			cyRef.current.style().fromJson(styles).update();
		}
	}, [styles]);

	useEffect(() => {
		if (!containerRef.current) return;

		// 1. Initialize Cytoscape
		cyRef.current = cytoscape({
			container: containerRef.current,
			elements: [],
			style: styles, // Initial styles
			layout: LAYOUT_CONFIG,
			wheelSensitivity: 3,
			minZoom: 0.2,
			maxZoom: 3,
			autoungrabify: true,
		});

		const cy = cyRef.current;

		// --- EVENT HANDLERS ---

		cy.on('tap', 'node', (evt) => {
			const node = evt.target;
			cy.elements().removeClass('highlighted dimmed');
			const connectedEdges = node.connectedEdges();
			const connectedNodes = connectedEdges.connectedNodes();

			cy.elements().difference(connectedNodes.union(connectedEdges).union(node)).addClass('dimmed');

			node.addClass('highlighted');
			connectedNodes.addClass('highlighted');
			connectedEdges.addClass('highlighted');
		});

		cy.on('tap', (evt) => {
			if (evt.target === cy) {
				cy.elements().removeClass('highlighted dimmed');
			}
		});

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
		// We exclude 'styles' here because we handle style updates
		// in the separate useEffect above to prevent destroying the whole graph.
	}, [navigate]);

	// Handle Data Updates
	useEffect(() => {
		if (!cyRef.current || !elements) return;

		const cy = cyRef.current;

		cy.batch(() => {
			cy.elements().remove();
			cy.add(elements);
		});

		if (elements.length > 0) {
			cy.layout(LAYOUT_CONFIG).run();
		}
	}, [elements]);

	return <div ref={containerRef} className='absolute inset-0 w-full h-full' />;
};
