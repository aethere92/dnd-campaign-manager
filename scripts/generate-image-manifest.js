import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp'; // Requires: npm install sharp

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const IMAGE_ROOT = path.resolve(__dirname, '../public/images');
const OUTPUT_FILE = path.resolve(__dirname, '../src/features/admin/config/imageManifest.json');

// Files to process (we will convert these to .webp)
const INPUT_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];
// Files to include in the manifest
const VALID_EXTENSIONS = ['.webp', '.svg', '.gif'];

// Set to TRUE to delete the original .png/.jpg after successful conversion
const DELETE_ORIGINALS = true;

/**
 * 1. RECURSIVE CONVERSION
 * Finds images, converts to WebP using Sharp, and optionally deletes originals.
 */
async function processDirectory(dir) {
	const items = fs.readdirSync(dir);

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			await processDirectory(fullPath);
		} else {
			const ext = path.extname(item).toLowerCase();

			// If it's a target image format (PNG/JPG), convert it
			if (INPUT_EXTENSIONS.includes(ext)) {
				const outputPath = fullPath.replace(ext, '.webp');

				// Skip if the webp version already exists to save time/cpu
				if (!fs.existsSync(outputPath)) {
					console.log(`⚙️ Converting: ${item} -> .webp`);

					try {
						await sharp(fullPath)
							.webp({
								quality: 80, // 0-100. 80 is a great balance of size/quality
								lossless: false, // false = smaller size, slightly lossy. true = bit-exact but larger
								effort: 6, // 0-6. 6 = slowest encoding but best compression
								smartSubsample: true, // High quality chroma subsampling
							})
							.toFile(outputPath);

						if (DELETE_ORIGINALS) {
							fs.unlinkSync(fullPath);
						}
					} catch (err) {
						console.error(`❌ Failed to convert ${item}:`, err);
					}
				} else {
					// Logic check: If we have both .png and .webp and DELETE_ORIGINALS is true,
					// we should clean up the old .png even if we didn't convert it just now.
					if (DELETE_ORIGINALS) {
						fs.unlinkSync(fullPath);
						console.log(`🗑️ Removed redundant original: ${item}`);
					}
				}
			}
		}
	}
}

/**
 * 2. MANIFEST GENERATION
 * (Your original logic, adapted to look for the new file types)
 */
function scanDirForManifest(dir, categories = []) {
	const items = fs.readdirSync(dir);
	const filesInThisDir = [];

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			scanDirForManifest(fullPath, categories);
		} else {
			// Only add files that match VALID_EXTENSIONS (mostly .webp and .svg now)
			if (VALID_EXTENSIONS.includes(path.extname(item).toLowerCase())) {
				filesInThisDir.push(item);
			}
		}
	}

	if (filesInThisDir.length > 0) {
		const relativePath = path.relative(IMAGE_ROOT, dir).replace(/\\/g, '/');

		const label = relativePath
			? relativePath
					.split('/')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' > ')
			: 'General';

		categories.push({
			category: label,
			path: `images/${relativePath ? relativePath + '/' : ''}`,
			files: filesInThisDir.sort(),
		});
	}

	return categories;
}

async function run() {
	if (!fs.existsSync(IMAGE_ROOT)) {
		console.error('❌ Directory public/images not found!');
		return;
	}

	console.log('🚀 Starting Image Optimization & Manifest Generation...');

	// Step 1: Convert images
	await processDirectory(IMAGE_ROOT);
	console.log('✨ Conversion complete.');

	// Step 2: Generate Manifest
	console.log('📝 Generating Manifest...');
	const manifest = scanDirForManifest(IMAGE_ROOT);

	// Sort categories alphabetically
	manifest.sort((a, b) => a.category.localeCompare(b.category));

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
	console.log(`✅ Success! Manifest generated with ${manifest.length} categories.`);
}

run();
