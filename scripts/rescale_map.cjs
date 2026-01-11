const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CONFIGURATION
// ==========================================
const CONFIG = {
	inputFile: 'map_jsons/unnamed_island_input.json', // MUST be the ORIGINAL large-coordinate file
	outputFile: 'map_jsons/unnamed_island_output.json', // The result file

	// OLD CONFIG (The setup where coordinates were correct)
	old: {
		width: 4096, // Updated based on your correction
		height: 3072,
		maxZoom: 3, // Divisor 32
	},

	// NEW CONFIG (Your current setup in AtlasContext debug logs)
	current: {
		width: 4096,
		height: 3072,
		maxZoom: 4, // Divisor 64
	},

	precision: 6, // Decimal places
};

// ==========================================
// 2. MATH LOGIC
// ==========================================

// Calculate the effective grid size for both maps
// Formula: ImageSize / (2 ^ MaxZoom)
const oldGridX = CONFIG.old.width / Math.pow(2, CONFIG.old.maxZoom);
const oldGridY = CONFIG.old.height / Math.pow(2, CONFIG.old.maxZoom);

const newGridX = CONFIG.current.width / Math.pow(2, CONFIG.current.maxZoom);
const newGridY = CONFIG.current.height / Math.pow(2, CONFIG.current.maxZoom);

// Calculate the scaling factor needed to shrink old coords to new grid
const scaleX = newGridX / oldGridX;
const scaleY = newGridY / oldGridY;

console.log(`\n📊 SCALING REPORT`);
console.log(`-------------------------------------------`);
console.log(`Old Grid Width: ${oldGridX.toFixed(2)} units`);
console.log(`New Grid Width: ${newGridX.toFixed(2)} units`);
console.log(`-------------------------------------------`);
console.log(`Multiplying Latitude (Y) by: ${scaleY.toFixed(6)}`);
console.log(`Multiplying Longitude (X) by: ${scaleX.toFixed(6)}`);
console.log(`(This will shrink coords to approx 25% of original size)`);
console.log(`-------------------------------------------\n`);

const round = (num) => parseFloat(num.toFixed(CONFIG.precision));

// Transform Helper: [lat, lng] -> [lat * scaleY, lng * scaleX]
const transformArray = ([lat, lng]) => {
	if (typeof lat !== 'number' || typeof lng !== 'number') return [lat, lng];
	return [round(lat * scaleY), round(lng * scaleX)];
};

// Transform Helper: { lat, lng } object
const transformObj = (item) => {
	if (item.lat !== undefined) item.lat = round(item.lat * scaleY);
	if (item.lng !== undefined) item.lng = round(item.lng * scaleX);
	return item;
};

// ==========================================
// 3. PROCESSORS
// ==========================================

function processAreas(areas) {
	if (!areas) return;
	Object.keys(areas).forEach((groupKey) => {
		const group = areas[groupKey];
		if (group.items && Array.isArray(group.items)) {
			group.items.forEach((area) => {
				if (area.points) {
					area.points.forEach((p) => {
						if (p.coordinates) p.coordinates = transformArray(p.coordinates);
					});
				}
				if (area.labelPosition) {
					area.labelPosition = transformArray(area.labelPosition);
				}
				// Handle areas that might store raw positions array
				if (area.positions) {
					area.positions = area.positions.map((p) => transformArray(p));
				}
			});
		}
	});
}

function processPaths(paths) {
	if (!paths || !Array.isArray(paths)) return;
	paths.forEach((path) => {
		if (path.points) {
			path.points.forEach((p) => {
				if (p.coordinates) p.coordinates = transformArray(p.coordinates);
			});
		}
		if (path.lights && path.lights.coordinates) {
			path.lights.coordinates = path.lights.coordinates.map((coord) => transformArray(coord));
		}
	});
}

function processAnnotations(annotations) {
	if (!annotations) return;
	Object.keys(annotations).forEach((groupKey) => {
		const group = annotations[groupKey];
		if (group.items && Array.isArray(group.items)) {
			group.items.forEach((item) => {
				transformObj(item);
			});
		}
	});
}

function processOverlays(overlays) {
	if (!overlays || !Array.isArray(overlays)) return;
	overlays.forEach((overlay) => {
		if (overlay.bounds) {
			overlay.bounds = overlay.bounds.map((coord) => transformArray(coord));
		}
	});
}

// ==========================================
// 4. EXECUTION
// ==========================================
try {
	console.log(`Reading ${CONFIG.inputFile}...`);
	const rawData = fs.readFileSync(path.join(__dirname, CONFIG.inputFile), 'utf8');
	const data = JSON.parse(rawData);

	processAreas(data.areas);
	processPaths(data.paths);
	processAnnotations(data.annotations);
	processOverlays(data.overlays);

	fs.writeFileSync(path.join(__dirname, CONFIG.outputFile), JSON.stringify(data, null, 4));

	console.log(`✅ Success! Created ${CONFIG.outputFile}`);
	console.log(`👉 Upload this file's content to your DB "data" column.`);
} catch (err) {
	console.error('❌ Error:', err.message);
}
