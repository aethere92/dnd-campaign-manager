/**
 * Attribute Transform Functions
 * Pure functions for processing entity attributes into view model format
 */

import {
	parseAttributeValue,
	parseAbilityScores,
	parseTagList,
	isIgnoredAttribute,
	isNarrativeAttribute,
	isListAttribute,
} from '../../../utils/entity/attributeParser';

/**
 * Determine if an attribute should go to sidebar or main content
 * @param {string} key - Attribute key
 * @param {*} value - Attribute value
 * @returns {'sidebar'|'main'|'ignore'}
 */
const getAttributeDestination = (key, value) => {
	const normalizedKey = key.toLowerCase();

	if (isIgnoredAttribute(normalizedKey)) {
		return 'ignore';
	}

	// Special widgets always go to sidebar
	if (
		['abilities', 'stats', 'ability score', 'saving throw', 'saves', 'skills', 'languages', 'proficiencies'].includes(
			normalizedKey
		)
	) {
		return 'sidebar';
	}

	// Lists always go to main content
	if (isListAttribute(normalizedKey) && Array.isArray(value)) {
		return 'main';
	}

	// Narrative text goes to main
	if (isNarrativeAttribute(normalizedKey)) {
		return 'main';
	}

	// Long text goes to main
	if (typeof value === 'string' && value.length > 100) {
		return 'main';
	}

	// Everything else to sidebar
	return 'sidebar';
};

/**
 * Process special widget attributes (ability scores, tags)
 * @param {string} key - Attribute key
 * @param {*} value - Raw attribute value
 * @returns {Object|null} Processed trait or null
 */
const processSpecialWidget = (key, value) => {
	const normalizedKey = key.toLowerCase();

	// Ability scores / stats
	if (['abilities', 'stats'].includes(normalizedKey)) {
		const strVal = parseAttributeValue(value);
		return {
			key,
			value: parseAbilityScores(strVal),
			displayType: 'stat-grid',
		};
	}

	// Tag lists
	if (['ability score', 'saving throw', 'saves', 'skills', 'languages', 'proficiencies'].includes(normalizedKey)) {
		const strVal = parseAttributeValue(value);
		return {
			key,
			value: parseTagList(strVal),
			displayType: 'tags',
		};
	}

	return null;
};

/**
 * Transform attributes into sidebar traits and main content sections
 * @param {Object} attributes - Parsed attributes object
 * @param {string} entityDescription - Entity description (to avoid duplication)
 * @returns {{traits: Array, sections: Array}}
 */
export const transformAttributes = (attributes, entityDescription = '') => {
	const traits = [];
	const sections = [];

	Object.entries(attributes).forEach(([key, rawVal]) => {
		// 1. Check for special widgets first
		const widget = processSpecialWidget(key, rawVal);
		if (widget) {
			traits.push(widget);
			return;
		}

		// 2. Parse value
		const displayVal = parseAttributeValue(rawVal, key);
		if (!displayVal) return;

		// 3. Skip if it's the same as description
		const normalizedKey = key.toLowerCase();
		if (normalizedKey === 'description' && displayVal === entityDescription) {
			return;
		}

		// 4. Determine destination
		const destination = getAttributeDestination(key, displayVal);
		if (destination === 'ignore') return;

		// 5. Route to appropriate collection
		if (destination === 'main') {
			// Lists stay as arrays
			if (isListAttribute(normalizedKey) && Array.isArray(displayVal)) {
				sections.push({
					key,
					value: displayVal,
					displayType: 'list',
				});
			} else {
				// Join arrays into text for narrative
				const textValue = Array.isArray(displayVal) ? displayVal.join('\n\n') : displayVal;
				sections.push({
					key,
					value: textValue,
					displayType: 'narrative',
				});
			}
		} else {
			// Sidebar trait
			const textValue = Array.isArray(displayVal) ? displayVal.join(', ') : displayVal;
			traits.push({
				key,
				value: textValue,
				displayType: 'text',
			});
		}
	});

	return { traits, sections };
};

/**
 * Extract extra tags for entity header (session-specific)
 * @param {Object} attributes - Parsed attributes
 * @param {string} entityType - Entity type
 * @returns {string[]}
 */
export const extractHeaderTags = (attributes, entityType) => {
	const tags = [];

	if (entityType === 'session') {
		if (attributes.Session) {
			tags.push(`Session ${attributes.Session}`);
		}
		if (attributes.Date) {
			tags.push(attributes.Date);
		}
	}

	return tags;
};
