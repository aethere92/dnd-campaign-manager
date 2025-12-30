import { useState, useEffect } from 'react';

export const THEMES = {
	LIGHT: 'light',
	// DARK: 'dark',
	DND: 'dnd',
};

export function useTheme() {
	const [theme, setTheme] = useState(() => {
		const stored = localStorage.getItem('app-theme');
		return stored || THEMES.LIGHT;
	});

	useEffect(() => {
		const root = window.document.documentElement;
		// Remove old themes
		Object.values(THEMES).forEach((t) => root.removeAttribute('data-theme'));

		// Apply new theme
		if (theme !== THEMES.LIGHT) {
			root.setAttribute('data-theme', theme);
		}

		localStorage.setItem('app-theme', theme);
	}, [theme]);

	const cycleTheme = () => {
		const themes = Object.values(THEMES);
		const currentIndex = themes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		setTheme(themes[nextIndex]);
	};

	return { theme, setTheme, cycleTheme };
}
