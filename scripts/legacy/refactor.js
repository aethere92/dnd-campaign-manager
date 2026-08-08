import fs from 'fs';

// 1. CONFIGURATION
const INPUT_FILE = 'campaign_01.js';
const OUTPUT_FILE = 'campaign_01_cleaned.js';

// Keys to completely remove
const KEYS_TO_REMOVE = ['icon', 'iconType', 'animation', 'pointColor', 'pointWidth', 'filter', 'loot', 'image'];

// Keys to force to the top of objects
const KEY_ORDER = ['label', 'name', 'lat', 'lng', 'coordinates', 'text'];

// 2. HELPERS

/**
 * Recursively cleans and reorders objects
 */
function cleanAndReorder(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(cleanAndReorder);
	}

	const newObj = {};

	// 1. Add High Priority Keys first
	KEY_ORDER.forEach((key) => {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			newObj[key] = cleanAndReorder(obj[key]);
		}
	});

	// 2. Add remaining keys (filtering out removed ones)
	Object.keys(obj).forEach((key) => {
		if (KEYS_TO_REMOVE.includes(key)) return;
		if (KEY_ORDER.includes(key)) return;

		newObj[key] = cleanAndReorder(obj[key]);
	});

	return newObj;
}

/**
 * Converts object to formatted JS string using single quotes
 */
function toJsString(obj, indentLevel = 0) {
	const indent = '\t'.repeat(indentLevel);
	const nextIndent = '\t'.repeat(indentLevel + 1);

	if (obj === null) return 'null';
	if (typeof obj === 'undefined') return 'undefined';

	// Force single quotes for strings
	if (typeof obj === 'string') {
		const escaped = obj.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
		return `'${escaped}'`;
	}

	if (typeof obj !== 'object') return String(obj);

	if (Array.isArray(obj)) {
		if (obj.length === 0) return '[]';

		// Keep coordinate arrays [x, y] on one line
		if (obj.length === 2 && typeof obj[0] === 'number') {
			return `[${obj.join(', ')}]`;
		}

		const items = obj.map((item) => toJsString(item, indentLevel + 1));
		return `[\n${nextIndent}${items.join(`,\n${nextIndent}`)}\n${indent}]`;
	}

	const keys = Object.keys(obj);
	if (keys.length === 0) return '{}';

	const props = keys.map((key) => {
		const value = toJsString(obj[key], indentLevel + 1);
		const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
		return `${cleanKey}: ${value}`;
	});

	return `{\n${nextIndent}${props.join(`,\n${nextIndent}`)}\n${indent}}`;
}

// 3. MAIN LOGIC
try {
	console.log(`Reading ${INPUT_FILE}...`);
	let fileContent = fs.readFileSync(INPUT_FILE, 'utf8');

	// Remove "export" keywords to allow local eval
	const cleanCode = fileContent.replace(/export const/g, 'const');

	// Evaluate code to get objects
	const { CAMPAIGN_01, CAMPAIGN_01_ALIASES } = eval(`
        ${cleanCode}
        ;({ CAMPAIGN_01, CAMPAIGN_01_ALIASES });
    `);

	console.log('Cleaning and reordering data...');
	const cleanedCampaign = cleanAndReorder(CAMPAIGN_01);
	const cleanedAliases = cleanAndReorder(CAMPAIGN_01_ALIASES);

	// 4. DATA EXTRACTION

	// Extract Paths
	let WORLD_MAP_PATHS = [];
	if (cleanedCampaign.world_maps?.paths) {
		WORLD_MAP_PATHS = cleanedCampaign.world_maps.paths;
		// Set placeholder
		cleanedCampaign.world_maps.paths = 'PLACEHOLDER_PATHS';
	}

	// Extract Korinis
	let KORINIS_ISLAND = null;
	if (cleanedCampaign.world_maps?.submaps?.islands?.korinis_island) {
		KORINIS_ISLAND = cleanedCampaign.world_maps.submaps.islands.korinis_island;
		cleanedCampaign.world_maps.submaps.islands.korinis_island = 'PLACEHOLDER_KORINIS';
	}

	// Extract Unnamed Island
	let UNNAMED_ISLAND = null;
	if (cleanedCampaign.world_maps?.submaps?.islands?.unnamed_island_01) {
		UNNAMED_ISLAND = cleanedCampaign.world_maps.submaps.islands.unnamed_island_01;
		cleanedCampaign.world_maps.submaps.islands.unnamed_island_01 = 'PLACEHOLDER_UNNAMED';
	}

	// 5. FILE GENERATION
	console.log('Generating output string...');

	let output = `// ==========================================
// ALIASES
// ==========================================
export const CAMPAIGN_01_ALIASES = ${toJsString(cleanedAliases)};

// ==========================================
// EXTRACTED DATA
// ==========================================

// --- World Map Paths ---
const WORLD_MAP_PATHS = ${toJsString(WORLD_MAP_PATHS)};

`;

	if (KORINIS_ISLAND) {
		output += `// --- Submap: Korinis Island ---\nconst KORINIS_ISLAND = ${toJsString(KORINIS_ISLAND)};\n\n`;
	}

	if (UNNAMED_ISLAND) {
		output += `// --- Submap: Unnamed Island ---\nconst UNNAMED_ISLAND = ${toJsString(UNNAMED_ISLAND)};\n\n`;
	}

	// Generate main string
	let mainString = toJsString(cleanedCampaign);

	// 6. REPLACE PLACEHOLDERS (Robust Regex)
	// Matches 'PLACEHOLDER' or "PLACEHOLDER"
	mainString = mainString.replace(/['"]PLACEHOLDER_PATHS['"]/g, 'WORLD_MAP_PATHS');
	mainString = mainString.replace(/['"]PLACEHOLDER_KORINIS['"]/g, 'KORINIS_ISLAND');
	mainString = mainString.replace(/['"]PLACEHOLDER_UNNAMED['"]/g, 'UNNAMED_ISLAND');

	output += `// ==========================================
// MAIN CAMPAIGN OBJECT
// ==========================================
export const CAMPAIGN_01 = ${mainString};
`;

	fs.writeFileSync(OUTPUT_FILE, output);
	console.log(`\n✅ Success! File saved to: ${OUTPUT_FILE}`);
} catch (err) {
	console.error('❌ Error:', err.message);
	console.error(err.stack);
}
