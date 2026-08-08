import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this to your source root (e.g., '../src' or '../')
const ROOT_DIR = path.resolve(__dirname, '../');

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'dev_helpers'];

function scanDir(dir) {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		if (IGNORE_DIRS.includes(file)) return;

		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			scanDir(fullPath);
		} else if (file.endsWith('.jsx') || file.endsWith('.js')) {
			checkFile(fullPath);
		}
	});
}

function checkFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	lines.forEach((line, index) => {
		// Check for relative parent imports
		if (line.includes("from '../") || line.includes('from "../')) {
			console.warn(`⚠️  Relative Import found in ${path.basename(filePath)}:${index + 1}`);
			console.warn(`   ${line.trim()}`);
		}

		// Check for old specific paths that we know were refactored
		if (line.includes('utils/text/') || line.includes('features/app-core')) {
			console.error(`🚨 DEAD PATH REFERENCE in ${path.basename(filePath)}:${index + 1}`);
			console.error(`   ${line.trim()}`);
		}
	});
}

console.log('🔍 Scanning for legacy code patterns...');
scanDir(ROOT_DIR);
console.log('✅ Scan complete.');
