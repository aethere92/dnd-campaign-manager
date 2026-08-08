import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../');

// Directories to skip
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'dev_helpers', 'assets'];

// MAPPINGS: Old Hardcoded Class -> New Semantic Class
const REPLACEMENTS = [
	// Backgrounds
	{ regex: /bg-white/g, replace: 'bg-card' },
	{ regex: /bg-gray-50/g, replace: 'bg-muted/30' },
	{ regex: /bg-gray-100/g, replace: 'bg-muted' },
	{ regex: /bg-slate-50/g, replace: 'bg-muted/30' },
	{ regex: /bg-slate-100/g, replace: 'bg-muted' },
	{ regex: /bg-stone-50/g, replace: 'bg-muted/30' },
	{ regex: /bg-stone-100/g, replace: 'bg-muted' },

	// Text Colors
	{ regex: /text-gray-900/g, replace: 'text-foreground' },
	{ regex: /text-gray-800/g, replace: 'text-foreground' },
	{ regex: /text-slate-900/g, replace: 'text-foreground' },
	{ regex: /text-gray-700/g, replace: 'text-foreground/80' },
	{ regex: /text-gray-600/g, replace: 'text-muted-foreground' },
	{ regex: /text-gray-500/g, replace: 'text-muted-foreground' },
	{ regex: /text-gray-400/g, replace: 'text-muted-foreground/70' },
	{ regex: /text-slate-500/g, replace: 'text-muted-foreground' },

	// Borders
	{ regex: /border-gray-100/g, replace: 'border-border/50' },
	{ regex: /border-gray-200/g, replace: 'border-border' },
	{ regex: /border-gray-300/g, replace: 'border-border' },
	{ regex: /border-slate-200/g, replace: 'border-border' },
	{ regex: /border-stone-200/g, replace: 'border-border' },

	// Accents (Making them transparent for dark mode compatibility)
	{ regex: /bg-amber-50/g, replace: 'bg-amber-500/10' },
	{ regex: /bg-blue-50/g, replace: 'bg-blue-500/10' },
	{ regex: /bg-emerald-50/g, replace: 'bg-emerald-500/10' },
	{ regex: /bg-red-50/g, replace: 'bg-red-500/10' },
	{ regex: /bg-purple-50/g, replace: 'bg-purple-500/10' },
];

function scanDir(dir) {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		if (IGNORE_DIRS.includes(file)) return;

		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			scanDir(fullPath);
		} else if (file.endsWith('.jsx') || file.endsWith('.js')) {
			processFile(fullPath);
		}
	});
}

function processFile(filePath) {
	let content = fs.readFileSync(filePath, 'utf-8');
	let originalContent = content;
	let changed = false;

	REPLACEMENTS.forEach((mapping) => {
		if (mapping.regex.test(content)) {
			content = content.replace(mapping.regex, mapping.replace);
			changed = true;
		}
	});

	if (changed) {
		fs.writeFileSync(filePath, content, 'utf-8');
		console.log(`✨ Fixed: ${path.relative(ROOT_DIR, filePath)}`);
	}
}

console.log('🌑 Starting Dark Mode Migration...');
scanDir(ROOT_DIR);
console.log('✅ Migration complete. Check your app!');
