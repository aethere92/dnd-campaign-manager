import { useState, useEffect, useRef } from 'react';

export function useTocObserver(itemIds) {
	const [activeId, setActiveId] = useState('');
	const observer = useRef(null);

	useEffect(() => {
		const handleIntersect = (entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveId(entry.target.id);
				}
			});
		};

		observer.current = new IntersectionObserver(handleIntersect, {
			rootMargin: '-20% 0px -35% 0px', // Trigger when element is in the middle-ish of screen
			threshold: 0.1,
		});

		const elements = itemIds.map((id) => document.getElementById(id));
		elements.forEach((el) => el && observer.current.observe(el));

		return () => observer.current?.disconnect();
	}, [itemIds]);

	return activeId;
}
