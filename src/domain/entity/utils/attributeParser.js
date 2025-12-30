/**
 * Attribute Parsing Utilities
 * Safe parsing and extraction of entity attributes
 */

/**
 * Parse attributes safely from JSON string, Object, or DB Row Array
 * @param {string|Object|Array} attrs - Raw attributes
 * @returns {Object} Parsed attributes object { key: value }
 */
export const parseAttributes = (attrs) => {
	if (!attrs) return {};

	// 1. Handle JSON String
	if (typeof attrs === 'string') {
		try {
			return JSON.parse(attrs);
		} catch {
			console.warn('Failed to parse attributes string:', attrs);
			return {};
		}
	}

	// 2. Handle DB Row Array: [{ name: 'icon', value: '...' }, ...]
	// This is common when joining tables (e.g. encounter_actions -> actor -> attributes)
	if (Array.isArray(attrs)) {
		// Check if it looks like a Name/Value pair list
		if (attrs.length > 0 && 'name' in attrs[0] && 'value' in attrs[0]) {
			return attrs.reduce((acc, curr) => {
				if (curr.name) acc[curr.name] = curr.value;
				return acc;
			}, {});
		}
		// Otherwise return as-is (might be a simple list attribute value)
		return {};
	}

	// 3. Already an Object
	return attrs;
};

// ... (Keep getAttributeValue and rest of file exactly as is) ...
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

// ... (Keep rest of file) ...
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

export const parseTagList = (val) => {
	if (!val) return [];
	if (Array.isArray(val)) return val.map(String);

	return String(val)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
};

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
		'map_image',
	];

	return ignoredKeys.includes(key.toLowerCase());
};

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

export const isListAttribute = (key) => {
	const listKeys = ['feature', 'features', 'traits', 'inventory', 'loot', 'spells'];
	return listKeys.includes(key.toLowerCase());
};

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
