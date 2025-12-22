import { useState, useEffect, useRef } from 'react';

export function useTocObserver(itemIds) {
	const [activeId, setActiveId] = useState('');
	const observer = useRef(null);
	const headingsMap = useRef(new Map());

	useEffect(() => {
		// 1. Safety Check
		if (!itemIds || itemIds.length === 0) return;

		// 2. The Callback
		const handleObserver = (entries) => {
			entries.forEach((entry) => {
				// Store all intersecting states in a map
				headingsMap.current.set(entry.target.id, entry);
			});

			// 3. Determine the "Winner"
			// We find the first visible heading from the top
			const visibleHeadings = [];

			headingsMap.current.forEach((entry) => {
				if (entry.isIntersecting) {
					visibleHeadings.push(entry);
				}
			});

			if (visibleHeadings.length > 0) {
				// Sort by their position relative to the top of the viewport
				// The one closest to 0 (top) without being way off-screen is the winner
				visibleHeadings.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				// Pick the top-most visible one
				setActiveId(visibleHeadings[0].target.id);
			} else {
				// Edge case: User scrolled past a section but next one hasn't entered.
				// We keep the last active ID or check if we are at the very top.
				const scrollY = window.scrollY;
				if (scrollY < 100 && itemIds.length > 0) {
					setActiveId(itemIds[0]);
				}
			}
		};

		// 4. Initialize Observer
		// rootMargin: '-10% 0px -80% 0px' creates a "reading line" at the top of the screen.
		// An element must cross this top zone to trigger the update.
		observer.current = new IntersectionObserver(handleObserver, {
			rootMargin: '-80px 0px -80% 0px',
			threshold: [0, 1],
		});

		// 5. Observe elements
		itemIds.forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				observer.current.observe(el);
			}
		});

		return () => {
			if (observer.current) observer.current.disconnect();
			headingsMap.current.clear();
		};
	}, [itemIds]);

	return activeId;
}
