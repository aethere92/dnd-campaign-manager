import { useState, useEffect } from 'react';

export function useTocObserver(itemIds) {
	const [activeId, setActiveId] = useState(null);

	useEffect(() => {
		if (!itemIds?.length) return;

		const handleScroll = () => {
			// The "reading line" is 100px down from the top of the viewport.
			// We want to highlight the last header that is ABOVE this line.
			const offset = 120;

			let newActiveId = null;

			// We iterate in REVERSE order.
			// The first header we encounter that is "above the line" (rect.top < offset)
			// is effectively the section we are currently reading.
			for (let i = itemIds.length - 1; i >= 0; i--) {
				const id = itemIds[i];
				const element = document.getElementById(id);

				if (element) {
					const rect = element.getBoundingClientRect();

					// if rect.top is less than 120px, the header has scrolled up past our "eye level"
					if (rect.top < offset) {
						newActiveId = id;
						break; // Stop looking, we found the deepest active header
					}
				}
			}

			setActiveId(newActiveId);
		};

		// 'capture: true' is CRITICAL here.
		// It allows us to detect scroll events on nested divs (like <main>)
		// that don't bubble up to window normally.
		window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

		// Run once on mount to set initial state
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll, { capture: true });
		};
	}, [itemIds]);

	return activeId;
}
