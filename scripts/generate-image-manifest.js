import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target: public/images
const IMAGE_ROOT = path.resolve(__dirname, '../public/images');
// Output: src/features/admin/config/imageManifest.json
const OUTPUT_FILE = path.resolve(__dirname, '../src/features/admin/config/imageManifest.json');

const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

/**
 * Recursively scans directories to find images and group them by folder path
 */
function scanDir(dir, categories = []) {
	const items = fs.readdirSync(dir);
	const filesInThisDir = [];

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			// Recursive call for subfolders
			scanDir(fullPath, categories);
		} else {
			// Check if file is an image
			if (VALID_EXTENSIONS.includes(path.extname(item).toLowerCase())) {
				filesInThisDir.push(item);
			}
		}
	}

	if (filesInThisDir.length > 0) {
		// Calculate the relative path from the /public/images folder
		// Example: "npcs/villains"
		const relativePath = path.relative(IMAGE_ROOT, dir).replace(/\\/g, '/');

		// Create a display label: "Npcs > Villains"
		const label =
			relativePath
				.split('/')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' > ') || 'General';

		categories.push({
			category: label,
			path: `images/${relativePath ? relativePath + '/' : ''}`,
			files: filesInThisDir.sort(), // Sort files A-Z
		});
	}

	return categories;
}

function run() {
	console.log('🔍 Scanning public/images recursively...');

	if (!fs.existsSync(IMAGE_ROOT)) {
		console.error('❌ Directory public/images not found!');
		return;
	}

	const manifest = scanDir(IMAGE_ROOT);

	// Sort categories alphabetically
	manifest.sort((a, b) => a.category.localeCompare(b.category));

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
	console.log(`✅ Success! Generated manifest with ${manifest.length} folders.`);
}

run();
