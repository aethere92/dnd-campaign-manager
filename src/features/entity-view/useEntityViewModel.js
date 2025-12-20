import { useMemo } from 'react';
import { getEntityConfig } from '../../config/entityConfig';
import './types';

const NARRATIVE_KEYS = [
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

// Keys that should ALWAYS be lists in the main body, never in sidebar
const LIST_KEYS = ['feature', 'features', 'traits', 'inventory', 'loot', 'spells'];

const IGNORED_KEYS = ['image', 'portrait', 'icon', 'token', 'session', 'date', 'summary', 'background_image'];

const parseAbilityScores = (val) => {
	if (!val || typeof val !== 'string') return [];
	return val.split(',').map((s) => {
		const parts = s.trim().split(' ');
		const name = parts[0];
		const score = parts.find((p) => /^\d+$/.test(p)) || '';
		const mod = parts.find((p) => p.includes('('))?.replace(/[()]/g, '') || '';
		return { name, score, mod };
	});
};

const parseTagList = (val) => {
	if (!val) return [];
	if (Array.isArray(val)) return val;
	return String(val)
		.split(',')
		.map((s) => s.trim());
};

const parseAttributeValue = (val, key) => {
	if (val === null || val === undefined) return null;

	// 1. If it's already an array, clean it
	if (Array.isArray(val)) {
		return val.map((item) => (typeof item === 'object' && item.value ? item.value : item));
	}

	// 2. Split text into array if it belongs to LIST_KEYS
	if (typeof val === 'string' && LIST_KEYS.includes(key?.toLowerCase())) {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	// 3. Unwrap objects
	if (typeof val === 'object' && val.value) return val.value;

	// 4. Fallback to string
	return String(val);
};

const getAttributeUrl = (val) => {
	if (!val) return null;

	let url = '';
	if (typeof val === 'string') url = val;
	else if (Array.isArray(val) && val[0]?.value) url = val[0].value;
	else if (typeof val === 'object' && val.value) url = val.value;

	if (!url) return null;
	let cleanPath = url.replace(/^(\.\.\/)+/, '');
	if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
	return `${import.meta.env.BASE_URL}${cleanPath}`;
};

const safeParseAttributes = (attrs) => {
	if (!attrs) return {};
	if (typeof attrs === 'object') return attrs;
	try {
		return JSON.parse(attrs);
	} catch (e) {
		return {};
	}
};

export function useEntityViewModel(entity) {
	return useMemo(() => {
		if (!entity) return null;

		const attributes = safeParseAttributes(entity.attributes);
		const isSession = entity.type === 'session';
		const config = getEntityConfig(entity.type);

		const traits = [];
		const narrativeSections = [];

		Object.entries(attributes).forEach(([key, rawVal]) => {
			const normalizedKey = key.toLowerCase();
			if (IGNORED_KEYS.includes(normalizedKey)) return;

			// Special Widgets
			if (['abilities', 'stats'].includes(normalizedKey)) {
				const strVal = parseAttributeValue(rawVal);
				traits.push({ key, value: parseAbilityScores(strVal), displayType: 'stat-grid' });
				return;
			}
			if (['ability score', 'saving throw', 'saves', 'skills', 'languages', 'proficiencies'].includes(normalizedKey)) {
				const strVal = parseAttributeValue(rawVal);
				traits.push({ key, value: parseTagList(strVal), displayType: 'tags' });
				return;
			}

			// Parse Value
			const displayVal = parseAttributeValue(rawVal, normalizedKey);
			if (!displayVal) return;
			if (normalizedKey === 'description' && displayVal === entity.description) return;

			// --- ROUTING LOGIC ---

			// 1. Force Lists to Main Content (Array Mode)
			if (LIST_KEYS.includes(normalizedKey) && Array.isArray(displayVal)) {
				narrativeSections.push({ key, value: displayVal, displayType: 'list' });
				return;
			}

			// 2. Prepare Value for Standard Text (Flatten Arrays if they aren't lists)
			// This FIXES the crash: If it's an array but not in LIST_KEYS, join it into a string.
			let finalValue = displayVal;
			if (Array.isArray(finalValue)) {
				finalValue = finalValue.join('\n\n');
			}

			// 3. Long text or specific keys -> Main Content (String Mode)
			if (NARRATIVE_KEYS.includes(normalizedKey) || (typeof finalValue === 'string' && finalValue.length > 100)) {
				narrativeSections.push({ key, value: finalValue });
			} else {
				// 4. Short text -> Sidebar
				traits.push({ key, value: finalValue, displayType: 'text' });
			}
		});

		// --- IMAGE & HEADER LOGIC ---
		const findBackground = () => {
			const keys = ['background_image', 'background', 'image', 'Image', 'portrait', 'Portrait'];
			for (const k of keys) {
				const url = getAttributeUrl(attributes[k]);
				if (url) return url;
			}
			return null;
		};

		const findIcon = () => {
			const keys = ['icon', 'Icon', 'token', 'Token', 'portrait', 'Portrait', 'image', 'Image'];
			for (const k of keys) {
				const url = getAttributeUrl(attributes[k]);
				if (url) return url;
			}
			return null;
		};

		const headerBackgroundUrl = findBackground();
		const avatarUrl = findIcon();

		// Status Check
		let statusRaw = parseAttributeValue(attributes.status, 'status');
		if (Array.isArray(statusRaw)) statusRaw = statusRaw.join(', ');
		if (statusRaw && typeof statusRaw !== 'string') statusRaw = String(statusRaw);

		const extraTags = [];
		if (isSession) {
			if (attributes.Session) extraTags.push(`Session ${attributes.Session}`);
			if (attributes.Date) extraTags.push(attributes.Date);
		}

		let relationships = entity.relationships || [];
		if (typeof relationships === 'string') {
			try {
				relationships = JSON.parse(relationships);
			} catch {}
		}

		const connections = relationships
			.map((rel) => {
				const relConfig = getEntityConfig(rel.entity_type);
				return {
					id: rel.entity_id || Math.random().toString(),
					name: rel.entity_name,
					typeLabel: rel.entity_type,
					role: rel.type?.toLowerCase().replace(/_/g, ' '),
					theme: { ...relConfig.tailwind, Icon: relConfig.icon },
				};
			})
			.slice(0, 8);

		let mainSummary = attributes.Summary || entity.summary;
		if (!mainSummary && !isSession) {
			mainSummary = entity.description;
		}

		return {
			layoutMode: isSession ? 'tabs' : 'standard',
			header: {
				title: entity.name,
				typeLabel: entity.type?.toUpperCase(),
				imageUrl: headerBackgroundUrl,
				avatarUrl: avatarUrl,
				status: {
					hasStatus: !!statusRaw,
					label: statusRaw,
					isDead: statusRaw?.toLowerCase() === 'dead',
				},
				extraTags,
				theme: { ...config.tailwind, Icon: config.icon },
			},
			sidebar: {
				traits,
				connections,
			},
			content: {
				narrative: isSession ? entity.description || '' : null,
				summary: mainSummary || '',
				sections: narrativeSections,
				history: Array.isArray(entity.events) ? entity.events : Object.values(entity.events || {}).flat(),
			},
		};
	}, [entity]);
}
