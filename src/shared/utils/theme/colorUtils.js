/**
 * Color and Theme Utilities
 * Color manipulation, hex/rgb conversion, opacity
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color (e.g., "#ff0000" or "ff0000")
 * @returns {{r: number, g: number, b: number}|null}
 */
export const hexToRgb = (hex) => {
	if (!hex) return null;

	// Remove # if present
	const cleanHex = hex.replace('#', '');

	// Validate hex
	if (!/^[0-9A-F]{6}$/i.test(cleanHex)) return null;

	return {
		r: parseInt(cleanHex.slice(0, 2), 16),
		g: parseInt(cleanHex.slice(2, 4), 16),
		b: parseInt(cleanHex.slice(4, 6), 16),
	};
};

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color
 */
export const rgbToHex = (r, g, b) => {
	const toHex = (n) => {
		const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Add opacity to hex color
 * @param {string} hex - Hex color
 * @param {number} opacity - Opacity (0-1)
 * @returns {string} rgba() string
 */
export const hexWithOpacity = (hex, opacity) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Lighten a hex color by percentage
 * @param {string} hex - Hex color
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} New hex color
 */
export const lightenColor = (hex, percent) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const amount = (percent / 100) * 255;

	return rgbToHex(rgb.r + amount, rgb.g + amount, rgb.b + amount);
};

/**
 * Darken a hex color by percentage
 * @param {string} hex - Hex color
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} New hex color
 */
export const darkenColor = (hex, percent) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const amount = (percent / 100) * 255;

	return rgbToHex(rgb.r - amount, rgb.g - amount, rgb.b - amount);
};

/**
 * Get contrasting text color (black or white) for background
 * @param {string} hex - Background hex color
 * @returns {string} '#000000' or '#ffffff'
 */
export const getContrastColor = (hex) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return '#000000';

	// Calculate relative luminance
	const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

	return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Check if a color is light or dark
 * @param {string} hex - Hex color
 * @returns {'light'|'dark'}
 */
export const getColorBrightness = (hex) => {
	return getContrastColor(hex) === '#000000' ? 'light' : 'dark';
};

/**
 * Generate color palette from base color
 * @param {string} hex - Base hex color
 * @returns {Object} Palette with shades
 */
export const generatePalette = (hex) => {
	return {
		50: lightenColor(hex, 45),
		100: lightenColor(hex, 40),
		200: lightenColor(hex, 30),
		300: lightenColor(hex, 20),
		400: lightenColor(hex, 10),
		500: hex,
		600: darkenColor(hex, 10),
		700: darkenColor(hex, 20),
		800: darkenColor(hex, 30),
		900: darkenColor(hex, 40),
	};
};

/**
 * Parse CSS color value (hex, rgb, rgba)
 * @param {string} color - CSS color string
 * @returns {{r: number, g: number, b: number, a: number}|null}
 */
export const parseColor = (color) => {
	if (!color) return null;

	// Hex
	if (color.startsWith('#')) {
		const rgb = hexToRgb(color);
		return rgb ? { ...rgb, a: 1 } : null;
	}

	// RGB/RGBA
	const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
	if (rgbaMatch) {
		return {
			r: parseInt(rgbaMatch[1]),
			g: parseInt(rgbaMatch[2]),
			b: parseInt(rgbaMatch[3]),
			a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
		};
	}

	return null;
};
