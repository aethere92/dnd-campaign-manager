import { getStrategy } from '@/features/admin/config/adminStrategies';

export const OPERATORS = [
	{ value: 'contains', label: 'Contains', needsValue: true },
	{ value: 'equals', label: 'Is Exactly', needsValue: true },
	{ value: 'starts_with', label: 'Starts With', needsValue: true },
	{ value: 'not_contains', label: 'Does Not Contain', needsValue: true },
	{ value: 'is_set', label: 'Has Any Value', needsValue: false },
	{ value: 'is_not_set', label: 'Is Empty / Missing', needsValue: false },
	{ value: 'true', label: 'Is True', needsValue: false },
	{ value: 'false', label: 'Is False', needsValue: false },
];

/**
 * deeply resolves a property from an object using dot notation
 * e.g. resolveField(item, 'attributes.race')
 */
export const resolveField = (obj, path) => {
	if (!obj || !path) return undefined;
	return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

/**
 * Applies a list of rules to the dataset.
 */
export const applyFilterRules = (data, rules) => {
	if (!data || !rules || rules.length === 0) return data;

	return data.filter((item) => {
		return rules.every((rule) => {
			const { field, operator, value } = rule;
			let itemValue = resolveField(item, field);

			// Normalization for comparison
			if (itemValue === undefined || itemValue === null) itemValue = '';

			// Handle number/boolean to string conversion for text search
			const strValue = String(itemValue).toLowerCase();
			const queryVal = String(value || '').toLowerCase();

			switch (operator) {
				case 'contains':
					return strValue.includes(queryVal);
				case 'not_contains':
					return !strValue.includes(queryVal);
				case 'equals':
					return strValue === queryVal;
				case 'starts_with':
					return strValue.startsWith(queryVal);
				case 'is_set':
					return itemValue !== '' && itemValue !== null && itemValue !== undefined;
				case 'is_not_set':
					return itemValue === '' || itemValue === null || itemValue === undefined;
				case 'true':
					return strValue === 'true' || itemValue === true;
				case 'false':
					return strValue === 'false' || itemValue === false;
				default:
					return true;
			}
		});
	});
};

/**
 * extractAvailableFields
 * Dynamically builds the list of filterable fields based on the Entity Strategy.
 */
export const extractAvailableFields = (type, data = []) => {
	const strategy = getStrategy(type);

	// 1. Determine Core Fields based on Strategy Mapping
	// e.g. Sessions use 'title' instead of 'name'
	const nameField = strategy.colMapping?.name || 'name';
	const descField = strategy.colMapping?.description || 'description';

	const fields = [
		{ value: nameField, label: 'Name / Title' },
		{ value: descField, label: 'Description / Narrative' },
	];

	// 2. Add Strategy Fields (Configured Attributes)
	if (strategy && strategy.defaultAttributes) {
		strategy.defaultAttributes.forEach((attr) => {
			fields.push({
				value: `attributes.${attr.key}`,
				label: attr.label,
			});
		});
	}

	// 3. Scan Data for Custom Attributes (Discovery Mode)
	// This allows filtering by ad-hoc fields added via JSON
	const seenKeys = new Set(fields.map((f) => f.value));

	data.forEach((item) => {
		if (!item.attributes) return;
		Object.keys(item.attributes).forEach((key) => {
			const path = `attributes.${key}`;
			if (!seenKeys.has(path)) {
				// Formatting: "custom_field" -> "Custom Field"
				const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
				fields.push({ value: path, label: `(Custom) ${label}` });
				seenKeys.add(path);
			}
		});
	});

	return fields.sort((a, b) => a.label.localeCompare(b.label));
};
