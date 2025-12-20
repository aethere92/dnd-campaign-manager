import { useState, useRef, useCallback } from 'react';
import './types';

export function useTooltipState() {
	const [activeTooltip, setActiveTooltip] = useState(null);
	const timeoutRef = useRef(null);

	const openTooltip = useCallback((e, id, type, isPinned = false) => {
		// If we are opening a new one, clear any pending close
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		// If it's pinned (mobile tap), we don't rely on mouse coordinates as much,
		// but we still need position.
		let x = e.clientX;
		const y = e.clientY;

		// Edge detection (Keep on screen)
		const OFFSET = 150;
		const SCREEN_PADDING = 20;

		if (x > window.innerWidth - OFFSET - SCREEN_PADDING) {
			x = window.innerWidth - OFFSET - SCREEN_PADDING;
		}
		if (x < OFFSET + SCREEN_PADDING) {
			x = OFFSET + SCREEN_PADDING;
		}

		setActiveTooltip({ id, type, pos: { x, y }, isPinned });
	}, []);

	const closeTooltip = useCallback(() => {
		// Add a delay so the user can move their mouse from the link TO the tooltip
		timeoutRef.current = setTimeout(() => {
			setActiveTooltip(null);
		}, 300); // 300ms grace period
	}, []);

	// NEW: Allows the Tooltip Card to say "I'm being hovered, don't close!"
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
