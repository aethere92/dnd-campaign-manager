import fs from 'fs';
import path from 'path';

// ==========================================
// CONFIGURATION
// ==========================================
const INPUT_FILE = 'campaign_01.js';

// We output deep into src so it's ready for Vite to pick up
const OUTPUT_DIR = 'campaign_01';

// ==========================================
// 1. HELPER: JS Stringifier
// ==========================================
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
		// Keep coordinates [x, y] on one line
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
		// Don't quote simple keys
		const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
		return `${cleanKey}: ${value}`;
	});

	return `{\n${nextIndent}${props.join(`,\n${nextIndent}`)}\n${indent}}`;
}

// ==========================================
// 2. HELPER: Recursive Extractor
// ==========================================
function extractMapsRecursively(obj, parentId = null, collectedMaps = []) {
	// If it has metadata, we treat it as a Map configuration
	if (obj.metadata) {
		const mapId = obj.metadata.mapId || 'unknown_map';

		// Clone to avoid mutating the original deeply nested structure immediately
		const mapData = { ...obj };

		// Add explicit parent ID for navigation logic
		if (parentId) {
			mapData.parentId = parentId;
		}

		// Check for children (submaps)
		if (obj.submaps) {
			Object.keys(obj.submaps).forEach((category) => {
				const categoryObj = obj.submaps[category];
				Object.keys(categoryObj).forEach((submapKey) => {
					// Recurse down
					extractMapsRecursively(categoryObj[submapKey], mapId, collectedMaps);
				});
			});
		}

		// Clean up the object (we don't want the nested submaps in the flat config)
		delete mapData.submaps;

		collectedMaps.push({
			id: mapId,
			data: mapData,
		});
	} else {
		// If it's the root container (CAMPAIGN_01)
		Object.keys(obj).forEach((key) => {
			if (obj[key] && typeof obj[key] === 'object') {
				extractMapsRecursively(obj[key], null, collectedMaps);
			}
		});
	}
	return collectedMaps;
}

// ==========================================
// 3. MAIN PROCESS
// ==========================================
try {
	console.log(`📖 Reading ${INPUT_FILE}...`);
	let fileContent = fs.readFileSync(INPUT_FILE, 'utf8');

	// Remove "export" keywords so we can eval it locally
	const cleanCode = fileContent.replace(/export const/g, 'const');

	// Evaluate to get the object
	const { CAMPAIGN_01 } = eval(`${cleanCode}; ({ CAMPAIGN_01 });`);

	console.log(`🔨 Flattening map hierarchy...`);
	const allMaps = extractMapsRecursively(CAMPAIGN_01);
	console.log(`   Found ${allMaps.length} maps.`);

	// Prepare Directories
	if (fs.existsSync(OUTPUT_DIR)) {
		fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
	}
	fs.mkdirSync(path.join(OUTPUT_DIR, 'maps'), { recursive: true });

	const registryImports = [];
	const registryExports = [];

	// Process every map found
	allMaps.forEach((map) => {
		const mapId = map.id;
		const mapData = map.data;
		const mapDir = path.join(OUTPUT_DIR, 'maps', mapId);

		fs.mkdirSync(mapDir, { recursive: true });

		const localImports = [];

		// -----------------------------------------------------
		// FILE EXTRACTION LOGIC
		// We replace data with strings like 'PLACEHOLDER_PATHS'
		// and then regex replace them later.
		// -----------------------------------------------------

		// 1. Paths
		if (mapData.paths && mapData.paths.length > 0) {
			const content = `export const paths = ${toJsString(mapData.paths)};`;
			fs.writeFileSync(path.join(mapDir, 'paths.js'), content);

			localImports.push(`import { paths } from './paths.js';`);
			mapData.paths = 'PLACEHOLDER_PATHS';
		}

		// 2. Annotations (POIs, NPCs, etc)
		if (mapData.annotations && Object.keys(mapData.annotations).length > 0) {
			const content = `export const annotations = ${toJsString(mapData.annotations)};`;
			fs.writeFileSync(path.join(mapDir, 'annotations.js'), content);

			localImports.push(`import { annotations } from './annotations.js';`);
			mapData.annotations = 'PLACEHOLDER_ANNOTATIONS';
		}

		// 3. Areas (Polygons)
		if (mapData.areas && Object.keys(mapData.areas).length > 0) {
			const content = `export const areas = ${toJsString(mapData.areas)};`;
			fs.writeFileSync(path.join(mapDir, 'areas.js'), content);

			localImports.push(`import { areas } from './areas.js';`);
			mapData.areas = 'PLACEHOLDER_AREAS';
		}

		// 4. Overlays
		if (mapData.overlays && mapData.overlays.length > 0) {
			const content = `export const overlays = ${toJsString(mapData.overlays)};`;
			fs.writeFileSync(path.join(mapDir, 'overlays.js'), content);

			localImports.push(`import { overlays } from './overlays.js';`);
			mapData.overlays = 'PLACEHOLDER_OVERLAYS';
		}

		// Generate the Map Config String
		let configStr = toJsString(mapData);

		// Replace Placeholders with actual variables
		// We match quotes around them because toJsString adds quotes to strings
		configStr = configStr.replace(/['"]PLACEHOLDER_PATHS['"]/g, 'paths');
		configStr = configStr.replace(/['"]PLACEHOLDER_ANNOTATIONS['"]/g, 'annotations');
		configStr = configStr.replace(/['"]PLACEHOLDER_AREAS['"]/g, 'areas');
		configStr = configStr.replace(/['"]PLACEHOLDER_OVERLAYS['"]/g, 'overlays');

		const mapVarName = mapId.toUpperCase();

		const indexContent = `
${localImports.join('\n')}

export const ${mapVarName} = ${configStr};
`;
		fs.writeFileSync(path.join(mapDir, 'index.js'), indexContent.trim());

		// Prepare Registry
		registryImports.push(`import { ${mapVarName} } from './maps/${mapId}/index.js';`);
		registryExports.push(`    [${mapVarName}.metadata.mapId]: ${mapVarName}`);
	});

	// ==========================================
	// 4. GENERATE REGISTRY
	// ==========================================
	const registryContent = `
${registryImports.join('\n')}

export const CAMPAIGN_01 = {
    name: 'Campaign 01',
    maps: {
${registryExports.join(',\n')}
    }
};
`;
	fs.writeFileSync(path.join(OUTPUT_DIR, 'index.js'), registryContent.trim());

	console.log(`✅ Done! Created modular React structure in:`);
	console.log(`   📂 ${OUTPUT_DIR}/`);
	console.log(`      📄 index.js (Import this in your App)`);
	console.log(`      📂 maps/ (Individual map configs)`);
} catch (err) {
	console.error('❌ Error:', err.message);
	console.error(err.stack);
}
