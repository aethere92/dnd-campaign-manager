/**
 * Attribute Parsing Utilities
 * Safe parsing and extraction of entity attributes
 */

/**
 * Parse attributes safely from JSON string or object
 * @param {string|Object} attrs - Raw attributes
 * @returns {Object} Parsed attributes object
 */
export const parseAttributes = (attrs) => {
	if (!attrs) return {};
	if (typeof attrs === 'object') return attrs;

	try {
		return JSON.parse(attrs);
	} catch {
		console.warn('Failed to parse attributes:', attrs);
		return {};
	}
};

/**
 * Extract a single attribute value (case-insensitive key lookup)
 * Handles nested structures: { value: "..." }, [{ value: "..." }], or plain strings
 *
 * @param {Object} attributes - Parsed attributes object
 * @param {string|string[]} keys - Key(s) to search for (tries each in order)
 * @returns {string|null} Extracted value or null
 */
export const getAttributeValue = (attributes, keys) => {
	if (!attributes) return null;

	// Normalize keys to array
	const keyList = Array.isArray(keys) ? keys : [keys];

	for (const key of keyList) {
		// Try exact match
		let val = attributes[key];

		// Try lowercase match
		if (!val) {
			val = attributes[key.toLowerCase()];
		}

		// Try capitalized match
		if (!val) {
			val = attributes[key.charAt(0).toUpperCase() + key.slice(1)];
		}

		if (!val) continue;

		// Unwrap nested structures
		if (typeof val === 'string') return val;
		if (Array.isArray(val) && val[0]?.value) return val[0].value;
		if (Array.isArray(val) && val[0]) return String(val[0]);
		if (typeof val === 'object' && val.value) return val.value;

		// Fallback: stringify
		return String(val);
	}

	return null;
};

/**
 * Parse attribute value intelligently based on context
 * Handles arrays, objects, and type conversion
 *
 * @param {*} val - Raw attribute value
 * @param {string} key - Attribute key (for context)
 * @returns {*} Parsed value
 */
export const parseAttributeValue = (val, key) => {
	if (val === null || val === undefined) return null;

	// 1. Already an array - clean it
	if (Array.isArray(val)) {
		return val.map((item) => (typeof item === 'object' && item.value ? item.value : item));
	}

	// 2. Check if this should be a list based on key name
	const listKeys = ['feature', 'features', 'traits', 'inventory', 'loot', 'spells'];
	if (typeof val === 'string' && listKeys.includes(key?.toLowerCase())) {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	// 3. Unwrap objects
	if (typeof val === 'object' && val.value) {
		return val.value;
	}

	// 4. Return as string
	return String(val);
};

/**
 * Parse ability scores from attribute string
 * Format: "STR 16 (+3), DEX 14 (+2), ..."
 *
 * @param {string} val - Ability scores string
 * @returns {Array<{name: string, score: string, mod: string}>}
 */
export const parseAbilityScores = (val) => {
	if (!val || typeof val !== 'string') return [];

	return val.split(',').map((s) => {
		const parts = s.trim().split(' ');
		const name = parts[0];
		const score = parts.find((p) => /^\d+$/.test(p)) || '';
		const mod = parts.find((p) => p.includes('('))?.replace(/[()]/g, '') || '';

		return { name, score, mod };
	});
};

/**
 * Parse comma-separated tags/list
 *
 * @param {string|Array} val - Raw value
 * @returns {string[]} Array of cleaned tags
 */
export const parseTagList = (val) => {
	if (!val) return [];
	if (Array.isArray(val)) return val.map(String);

	return String(val)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
};

/**
 * Check if an attribute key should be ignored in display
 * @param {string} key - Attribute key
 * @returns {boolean}
 */
export const isIgnoredAttribute = (key) => {
	const ignoredKeys = [
		'image',
		'portrait',
		'icon',
		'token',
		'session',
		'date',
		'summary',
		'background_image',
		'background',
		'is_active',
	];

	return ignoredKeys.includes(key.toLowerCase());
};

/**
 * Check if an attribute should be treated as narrative text
 * @param {string} key - Attribute key
 * @returns {boolean}
 */
export const isNarrativeAttribute = (key) => {
	const narrativeKeys = [
		'background',
		'personality',
		'history',
		'bio',
		'biography',
		'goals',
		'ideals',
		'bonds',
		'flaws',
		'notes',
		'gm notes',
		'description',
		'appearance',
		'tactics',
		'narrative',
	];

	return narrativeKeys.includes(key.toLowerCase());
};

/**
 * Check if an attribute should be displayed as a list
 * @param {string} key - Attribute key
 * @returns {boolean}
 */
export const isListAttribute = (key) => {
	const listKeys = ['feature', 'features', 'traits', 'inventory', 'loot', 'spells'];
	return listKeys.includes(key.toLowerCase());
};

/**
 * Determine display type for an attribute
 * @param {string} key - Attribute key
 * @param {*} value - Attribute value
 * @returns {'text'|'list'|'stat-grid'|'tags'|'narrative'}
 */
export const getAttributeDisplayType = (key, value) => {
	const normalizedKey = key.toLowerCase();

	// Special widgets
	if (['abilities', 'stats'].includes(normalizedKey)) {
		return 'stat-grid';
	}

	if (['ability score', 'saving throw', 'saves', 'skills', 'languages', 'proficiencies'].includes(normalizedKey)) {
		return 'tags';
	}

	// Force list display
	if (isListAttribute(key) && Array.isArray(value)) {
		return 'list';
	}

	// Narrative text
	if (isNarrativeAttribute(key)) {
		return 'narrative';
	}

	// Long text becomes narrative
	if (typeof value === 'string' && value.length > 100) {
		return 'narrative';
	}

	// Default
	return 'text';
};
