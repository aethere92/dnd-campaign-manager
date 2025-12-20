import { useState, useRef, useCallback } from 'react';
import './types';

export function useTooltipState() {
	const [activeTooltip, setActiveTooltip] = useState(null);
	const timeoutRef = useRef(null);

	const openTooltip = useCallback((e, id, type, isPinned = false) => {
		// If we are opening a new one, clear any pending close
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		// Get position from event
		let x = e.clientX;
		let y = e.clientY;

		// For touch events on mobile, use touch coordinates
		if (e.touches && e.touches[0]) {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}

		setActiveTooltip({ id, type, pos: { x, y }, isPinned });
	}, []);

	const closeTooltip = useCallback(() => {
		// Add a delay so the user can move their mouse from the link TO the tooltip
		timeoutRef.current = setTimeout(() => {
			setActiveTooltip(null);
		}, 300); // 300ms grace period
	}, []);

	// Allows the Tooltip Card to say "I'm being hovered, don't close!"
	const cancelClose = useCallback(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
	}, []);

	return {
		activeTooltip,
		openTooltip,
		closeTooltip,
		cancelClose,
	};
}
