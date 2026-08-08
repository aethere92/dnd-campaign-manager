import { useEffect, useRef, useState } from 'react';

/**
 * Reveal-on-scroll, dependency-free.
 *
 * The project has no framer-motion and the `animate-in` utility classes are
 * no-ops here (no tailwindcss-animate plugin), so entrance motion is done with
 * a plain IntersectionObserver toggling a class the component styles with a CSS
 * transition. Honours prefers-reduced-motion by revealing immediately.
 *
 *   const { ref, shown } = useReveal();
 *   <div ref={ref} className={clsx('dash-reveal', shown && 'is-shown')}>
 *
 * @param {Object}  [opts]
 * @param {number}  [opts.threshold=0.12] visibility fraction that triggers reveal
 * @param {boolean} [opts.once=true]      stop observing after first reveal
 */
// Show immediately (no entrance animation) when motion is unwelcome or the
// observer API is missing — decided once at mount so the effect never has to
// call setState synchronously in its body.
const revealImmediately = () =>
	(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) ||
	typeof IntersectionObserver === 'undefined';

export function useReveal({ threshold = 0.12, once = true } = {}) {
	const ref = useRef(null);
	const [shown, setShown] = useState(revealImmediately);

	useEffect(() => {
		const el = ref.current;
		if (!el || revealImmediately()) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setShown(true);
						if (once) observer.unobserve(entry.target);
					} else if (!once) {
						setShown(false);
					}
				});
			},
			{ threshold }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold, once]);

	return { ref, shown };
}
