/**
 * CSS Variable Utilities
 * Read and write CSS custom properties
 */

/**
 * Get CSS variable value from document root
 * @param {string} name - Variable name (with or without --)
 * @returns {string} Variable value
 */
export const getCSSVariable = (name) => {
	const varName = name.startsWith('--') ? name : `--${name}`;
	return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};

/**
 * Set CSS variable on document root
 * @param {string} name - Variable name (with or without --)
 * @param {string} value - Variable value
 */
export const setCSSVariable = (name, value) => {
	const varName = name.startsWith('--') ? name : `--${name}`;
	document.documentElement.style.setProperty(varName, value);
};

/**
 * Get all theme CSS variables
 * @returns {Object} Theme variables
 */
export const getThemeVariables = () => {
	return {
		background: getCSSVariable('--background'),
		foreground: getCSSVariable('--foreground'),
		muted: getCSSVariable('--muted'),
		mutedForeground: getCSSVariable('--muted-foreground'),
		border: getCSSVariable('--border'),
		accent: getCSSVariable('--accent'),
		accentForeground: getCSSVariable('--accent-foreground'),
	};
};

/**
 * Apply theme variables
 * @param {Object} theme - Theme variable object
 */
export const applyTheme = (theme) => {
	Object.entries(theme).forEach(([key, value]) => {
		// Convert camelCase to kebab-case
		const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
		setCSSVariable(cssKey, value);
	});
};

/**
 * Get current theme mode (light/dark/dnd)
 * @returns {string} Theme mode
 */
export const getCurrentTheme = () => {
	return document.documentElement.getAttribute('data-theme') || 'light';
};

/**
 * Set theme mode
 * @param {string} theme - Theme name (light/dark/dnd)
 */
export const setTheme = (theme) => {
	if (theme === 'light') {
		document.documentElement.removeAttribute('data-theme');
	} else {
		document.documentElement.setAttribute('data-theme', theme);
	}
	localStorage.setItem('app-theme', theme);
};

/**
 * Get stored theme preference
 * @returns {string} Stored theme or 'light'
 */
export const getStoredTheme = () => {
	return localStorage.getItem('app-theme') || 'light';
};

/**
 * Check if system prefers dark mode
 * @returns {boolean}
 */
export const prefersDarkMode = () => {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Get optimal theme based on preference and system
 * @returns {string} Theme name
 */
export const getOptimalTheme = () => {
	const stored = getStoredTheme();
	if (stored !== 'auto') return stored;

	return prefersDarkMode() ? 'dark' : 'light';
};
