import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/shared/utils/storage';

export const THEMES = {
	// LIGHT: 'light',
	DARK: 'dark',
	DND: 'dnd',
};

/**
 * Applied when nothing valid is stored. Light is currently commented out of
 * THEMES and therefore not user-selectable, so DARK is the default.
 *
 * Previously this defaulted to THEMES.LIGHT, which no longer exists — so `theme`
 * initialised to `undefined`, no data-theme was set, and the string "undefined"
 * was persisted to storage.
 */
const DEFAULT_THEME = THEMES.DARK;
const VALID_THEMES = Object.values(THEMES);

export function useTheme() {
	const [theme, setTheme] = useState(() => {
		const stored = storage.get(STORAGE_KEYS.THEME);
		// Reject values no longer in THEMES (a previously stored 'light', or the
		// literal "undefined" written by an older build).
		return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;
	});

	useEffect(() => {
		window.document.documentElement.setAttribute('data-theme', theme);
		storage.set(STORAGE_KEYS.THEME, theme);
	}, [theme]);

	const cycleTheme = () => {
		setTheme((current) => {
			const idx = VALID_THEMES.indexOf(current);
			return VALID_THEMES[(idx + 1) % VALID_THEMES.length];
		});
	};

	return { theme, setTheme, cycleTheme };
}
