import { useCallback } from 'react';

export function useTocScroll(callback) {
	const scrollToId = useCallback(
		(id) => {
			const element = document.getElementById(id);

			if (element) {
				// CSS 'scroll-margin-top' handles the offset (sticky header)
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });

				// Optional callback (e.g., to close mobile drawer)
				if (callback) callback();
			} else {
				console.warn(`[ToC] Target element not found: #${id}`);
			}
		},
		[callback]
	);

	return { scrollToId };
}
