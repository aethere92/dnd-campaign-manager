import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { useTheme } from '@/shared/hooks/useTheme';
import { getGraphStyles, LAYOUT_CONFIG } from '@/features/graph/config/graphStyles';

cytoscape.use(fcose);

export const CytoscapeCanvas = ({
	elements,
	layoutConfig = LAYOUT_CONFIG,
	stylesheet,
	onNodeClick,
	interactive = true,
}) => {
	const containerRef = useRef(null);
	const cyRef = useRef(null);

	// STABILITY FIX: Store callbacks in refs to prevent re-init on render
	const onNodeClickRef = useRef(onNodeClick);
	onNodeClickRef.current = onNodeClick;

	const navigate = useNavigate();
	const { theme } = useTheme();

	const styles = useMemo(() => {
		if (stylesheet) return stylesheet;
		return getGraphStyles(theme);
	}, [theme, stylesheet]);

	// Style Update (Lightweight)
	useEffect(() => {
		if (cyRef.current) {
			cyRef.current.style().fromJson(styles).update();
		}
	}, [styles]);

	// Initialization (Run ONCE)
	useEffect(() => {
		if (!containerRef.current) return;

		cyRef.current = cytoscape({
			container: containerRef.current,
			elements: [], // Elements added in separate effect
			style: styles,
			layout: { name: 'preset' }, // Initial static layout
			wheelSensitivity: 3,
			minZoom: 0.2,
			maxZoom: 4,
			zoomingEnabled: interactive,
			panningEnabled: interactive,
			userZoomingEnabled: interactive,
			userPanningEnabled: interactive,
			boxSelectionEnabled: false,
			autoungrabify: true,
		});

		const cy = cyRef.current;

		// Resize Observer
		const resizeObserver = new ResizeObserver(() => {
			if (cy && !cy.destroyed()) {
				cy.resize();
				cy.fit(null, 30);
			}
		});
		resizeObserver.observe(containerRef.current);

		// Event Delegation using Refs
		cy.on('tap', 'node', (evt) => {
			const data = evt.target.data();
			// 1. Priority: Custom Handler
			if (onNodeClickRef.current) {
				onNodeClickRef.current(data);
				return;
			}
			// 2. Default: Navigate (Global Graph behavior)
			// Note: In global graph, we might want double-click,
			// but preserving existing logic structure here.
			// If explicit onNodeClick is missing, we check interactive mode behavior
		});

		// Hover Effects
		if (interactive) {
			cy.on('mouseover', 'node', () => (containerRef.current.style.cursor = 'pointer'));
			cy.on('mouseout', 'node', () => (containerRef.current.style.cursor = 'default'));
		}

		// Default Global Graph Logic (Only if no custom handler passed)
		if (!onNodeClick) {
			cy.on('tap', (evt) => {
				if (evt.target === cy) cy.elements().removeClass('highlighted dimmed');
				else {
					const node = evt.target;
					cy.elements().removeClass('highlighted dimmed');
					const connectedEdges = node.connectedEdges();
					const connectedNodes = connectedEdges.connectedNodes();
					cy.elements().difference(connectedNodes.union(connectedEdges).union(node)).addClass('dimmed');
					node.addClass('highlighted');
					connectedNodes.addClass('highlighted');
					connectedEdges.addClass('highlighted');
				}
			});

			cy.on('dblclick', 'node', (evt) => {
				const { id, type } = evt.target.data();
				if (id && type) navigate(`/wiki/${type}/${id}`);
			});
		}

		return () => {
			resizeObserver.disconnect();
			if (cyRef.current) {
				cyRef.current.destroy();
				cyRef.current = null;
			}
		};
		// CRITICAL: Dependencies list is small. interactive/navigate shouldn't change often.
	}, [interactive, navigate]);

	// Data & Layout Updates
	useEffect(() => {
		if (!cyRef.current || !elements) return;
		const cy = cyRef.current;

		// Batch update elements
		cy.batch(() => {
			cy.elements().remove();
			cy.add(elements);
		});

		// Run Layout only if we have elements
		if (elements.length > 0) {
			// Apply Layout
			const layout = cy.layout({
				...layoutConfig,
				// Ensure fit happens AFTER layout finishes
				stop: () => {
					cy.fit(null, 30);
				},
			});
			layout.run();
		}
	}, [elements, layoutConfig]);

	return <div ref={containerRef} className='absolute inset-0 w-full h-full' />;
};
