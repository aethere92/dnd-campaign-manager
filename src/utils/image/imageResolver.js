/**
 * Centralized image URL resolution
 * Used by: EntityViewModel, EntityIndex, TooltipCard
 */

const IMAGE_KEYS = {
	background: ['background_image', 'background', 'Background', 'Background_image'],
	icon: ['icon', 'Icon', 'token', 'Token', 'portrait', 'Portrait'],
	any: ['background_image', 'background', 'image', 'Image', 'portrait', 'Portrait', 'icon', 'Icon'],
};

/**
 * Extract value from nested attribute structure
 */
const extractValue = (val) => {
	if (!val) return null;
	if (typeof val === 'string') return val;
	if (Array.isArray(val)) return val[0]?.value || val[0];
	if (typeof val === 'object' && val.value) return val.value;
	return null;
};

/**
 * Resolve image URL from attributes object
 * @param {Object} attributes - Entity attributes
 * @param {'background' | 'icon' | 'any'} type - Type of image to find
 * @returns {string|null} - Resolved URL or null
 */
export const resolveImageUrl = (attributes, type = 'any') => {
	if (!attributes) return null;

	const keys = IMAGE_KEYS[type] || IMAGE_KEYS.any;

	for (const key of keys) {
		const val = attributes[key] || attributes[key.toLowerCase()];
		const rawUrl = extractValue(val);

		if (rawUrl) {
			// Clean path and prepend base URL
			const cleanPath = rawUrl
				.trim()
				.replace(/(\.\.\/)+/g, '')
				.replace(/^\//, '');

			return `${import.meta.env.BASE_URL}${cleanPath}`;
		}
	}

	return null;
};

/**
 * Safe attribute parser
 */
export const parseAttributes = (attrs) => {
	if (!attrs) return {};
	if (typeof attrs === 'object') return attrs;
	try {
		return JSON.parse(attrs);
	} catch {
		return {};
	}
};
