import { useState, useEffect, useRef } from 'react';

/**
 * Calculates smart positioning for tooltips to keep them onscreen
 * @param {Object} targetPosition - { x, y } coordinates of the trigger element
 * @param {boolean} isOpen - Whether the tooltip is currently visible
 * @returns {Object} - { style, tooltipRef } for positioning
 */
export function useSmartPosition(targetPosition, isOpen) {
	const tooltipRef = useRef(null);
	const [position, setPosition] = useState({ top: 0, left: 0, transform: '' });
	const [isPositioned, setIsPositioned] = useState(false);

	useEffect(() => {
		if (!isOpen || !tooltipRef.current || !targetPosition) {
			setIsPositioned(false);
			return;
		}

		const calculatePosition = () => {
			const tooltip = tooltipRef.current;
			const rect = tooltip.getBoundingClientRect();

			// Get viewport dimensions
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Configuration
			const EDGE_PADDING = 10; // Minimum distance from screen edges
			const OFFSET_Y = 20; // Distance below cursor
			const TOOLTIP_WIDTH = 300; // Match your tooltip width

			let top = targetPosition.y + OFFSET_Y;
			let left = targetPosition.x;
			let transform = 'translateX(-50%)'; // Center by default

			// --- HORIZONTAL POSITIONING ---

			// Calculate where the tooltip would end up with center alignment
			const leftEdge = left - TOOLTIP_WIDTH / 2;
			const rightEdge = left + TOOLTIP_WIDTH / 2;

			if (rightEdge > viewportWidth - EDGE_PADDING) {
				// Tooltip would overflow right side
				// Align to right edge of viewport with padding
				left = viewportWidth - EDGE_PADDING;
				transform = 'translateX(-100%)'; // Right align
			} else if (leftEdge < EDGE_PADDING) {
				// Tooltip would overflow left side
				// Align to left edge of viewport with padding
				left = EDGE_PADDING;
				transform = 'translateX(0)'; // Left align
			}

			// --- VERTICAL POSITIONING ---

			// Check if tooltip would overflow bottom
			if (top + rect.height > viewportHeight - EDGE_PADDING) {
				// Position above the cursor instead
				top = targetPosition.y - rect.height - 10;

				// If it still doesn't fit above, clamp to top
				if (top < EDGE_PADDING) {
					top = EDGE_PADDING;
				}
			}

			// Ensure tooltip doesn't go above viewport
			if (top < EDGE_PADDING) {
				top = EDGE_PADDING;
			}

			setPosition({ top, left, transform });
			setIsPositioned(true);
		};

		// Initial calculation
		calculatePosition();

		// Recalculate on resize (debounced)
		let resizeTimer;
		const handleResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(calculatePosition, 100);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimer);
		};
	}, [targetPosition, isOpen]);

	const style = {
		position: 'fixed',
		top: `${position.top}px`,
		left: `${position.left}px`,
		transform: position.transform,
		zIndex: 9999,
		width: '300px',
		pointerEvents: 'auto',
		opacity: isPositioned ? 1 : 0,
		transition: 'opacity 0.15s ease-out',
	};

	return { style, tooltipRef, isPositioned };
}
