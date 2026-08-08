import { useState, useEffect, useCallback } from 'react';

/**
 * Fullscreen toggle for a container element.
 *
 * Replaces three separate implementations (MapTools, EntityMiniMap,
 * EntityLocalGraph) that behaved differently: only EntityLocalGraph had the
 * pseudo-fullscreen fallback for browsers without the Fullscreen API (notably
 * iOS Safari, where requestFullscreen is absent on non-video elements). This
 * hook takes that as the canonical behaviour, so fullscreen now works the same
 * way everywhere.
 *
 * When native fullscreen is unavailable or rejected, `isPseudo` is true and the
 * caller is expected to apply fixed-position styling itself.
 *
 * @param {React.RefObject<HTMLElement>} ref - Container to make fullscreen
 * @returns {{
 *   isFullscreen: boolean,   // active via either mechanism
 *   isPseudo: boolean,       // active via CSS fallback rather than the API
 *   toggle: (e?: Event) => void,
 *   exit: () => void,
 * }}
 */
export function useFullscreen(ref) {
	const [isNative, setIsNative] = useState(false);
	const [isPseudo, setIsPseudo] = useState(false);

	// Track native fullscreen changes, including the user pressing Escape or
	// exiting through browser chrome.
	useEffect(() => {
		const onChange = () => setIsNative(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', onChange);
		return () => document.removeEventListener('fullscreenchange', onChange);
	}, []);

	// Escape only fires fullscreenchange for native mode, so the CSS fallback
	// needs its own key handler.
	useEffect(() => {
		if (!isPseudo) return;
		const onKey = (e) => {
			if (e.key === 'Escape') setIsPseudo(false);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isPseudo]);

	const exit = useCallback(() => {
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {
				/* already exiting */
			});
		}
		setIsPseudo(false);
	}, []);

	const toggle = useCallback(
		(e) => {
			e?.stopPropagation?.();
			const el = ref?.current;
			if (!el) return;

			if (document.fullscreenElement || isPseudo) {
				exit();
				return;
			}

			if (typeof el.requestFullscreen === 'function') {
				// Fall back to CSS if the browser refuses (e.g. no user gesture).
				el.requestFullscreen().catch(() => setIsPseudo(true));
			} else {
				setIsPseudo(true);
			}
		},
		[ref, isPseudo, exit]
	);

	return { isFullscreen: isNative || isPseudo, isPseudo, toggle, exit };
}
