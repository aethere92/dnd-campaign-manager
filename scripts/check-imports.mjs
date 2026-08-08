/**
 * Static import verifier — runs with ZERO dependencies installed.
 *
 * Resolves every local import in src/ and confirms:
 *   1. the target file exists
 *   2. every *named* binding is actually exported by that file
 *      (following `export ... from` re-export chains)
 *
 * This is the stand-in for `vite build` when node_modules is absent.
 * It catches the dominant failure mode of a delete/consolidate refactor:
 * an import pointing at a file or symbol that no longer exists.
 *
 * Usage: node scripts/check-imports.mjs
 * Exit code 1 if any error found (0 = clean), so it can gate a commit.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(PROJECT_ROOT, 'src');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'outputs', 'dev_helpers']);
const EXTS = ['.js', '.jsx', '.json', '.ts', '.tsx'];

// Node codegen scripts, not app code: they emit import statements as string
// output and build paths from template literals, so static resolution is
// meaningless. (Phase 1 relocates these out of src/ entirely.)
const SKIP_FILES = new Set(['src/features/atlas/data/modularize.js', 'src/features/atlas/data/refactor.js']);

const errors = [];
const warnings = [];

// ---------------------------------------------------------------- file walking

function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name)) continue;
			walk(path.join(dir, entry.name), out);
		} else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
			out.push(path.join(dir, entry.name));
		}
	}
	return out;
}

// ------------------------------------------------------------------ resolution

/** Mirror Vite's resolution: exact file, then +ext, then /index+ext. */
function resolveModule(spec, fromFile) {
	let base;
	if (spec.startsWith('@/')) {
		base = path.join(SRC, spec.slice(2));
	} else if (spec.startsWith('.')) {
		base = path.resolve(path.dirname(fromFile), spec);
	} else {
		return { external: true };
	}

	if (fs.existsSync(base) && fs.statSync(base).isFile()) return { file: base };
	for (const ext of EXTS) {
		if (fs.existsSync(base + ext)) return { file: base + ext };
	}
	for (const ext of EXTS) {
		const idx = path.join(base, 'index' + ext);
		if (fs.existsSync(idx)) return { file: idx };
	}
	return { missing: true, attempted: base };
}

// --------------------------------------------------------------------- parsing

/**
 * Blank out comments and string/template literals so they can't be mistaken for
 * code. Replaces content with spaces to keep byte offsets (and thus line
 * numbers) intact. Without this, commented-out imports get reported.
 */
function stripNonCode(src) {
	let out = '';
	let i = 0;
	const n = src.length;

	// A '/' starts a regex literal (not division) when the previous significant
	// token can't end an expression. Needed because regex literals in this
	// codebase contain backticks and quotes that would otherwise desync the
	// scanner — e.g. wikiUtils.js: .replace(/`{1,3}[^`]+`{1,3}/g, '')
	const regexAllowedAfter = new Set([
		'(',
		',',
		'=',
		':',
		'[',
		'!',
		'&',
		'|',
		'?',
		'{',
		'}',
		';',
		'+',
		'-',
		'*',
		'%',
		'<',
		'>',
		'~',
		'^',
	]);
	const prevSignificant = () => {
		for (let k = out.length - 1; k >= 0; k--) {
			if (!/\s/.test(out[k])) return out[k];
		}
		return null;
	};

	while (i < n) {
		const c = src[i];
		const next = src[i + 1];

		if (c === '/' && next !== '/' && next !== '*') {
			const prev = prevSignificant();
			if (prev === null || regexAllowedAfter.has(prev)) {
				// Consume the regex literal, including char classes and escapes.
				out += ' ';
				i++;
				let inClass = false;
				while (i < n) {
					const rc = src[i];
					if (rc === '\\') {
						out += '  ';
						i += 2;
						continue;
					}
					if (rc === '\n') break; // unterminated — bail out safely
					if (rc === '[') inClass = true;
					else if (rc === ']') inClass = false;
					else if (rc === '/' && !inClass) {
						out += ' ';
						i++;
						break;
					}
					out += ' ';
					i++;
				}
				// Trailing flags
				while (i < n && /[a-z]/.test(src[i])) ((out += ' '), i++);
				continue;
			}
		}

		if (c === '/' && next === '/') {
			while (i < n && src[i] !== '\n') ((out += ' '), i++);
			continue;
		}
		if (c === '/' && next === '*') {
			out += '  ';
			i += 2;
			while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
				out += src[i] === '\n' ? '\n' : ' ';
				i++;
			}
			out += '  ';
			i += 2;
			continue;
		}
		// Preserve quoted strings: import specifiers live inside them. Template
		// literals are emptied, since dynamic paths can't be resolved statically.
		if (c === '"' || c === "'") {
			const quote = c;
			out += c;
			i++;
			while (i < n && src[i] !== quote) {
				if (src[i] === '\\') {
					out += src[i] + (src[i + 1] ?? '');
					i += 2;
					continue;
				}
				out += src[i];
				i++;
			}
			out += quote;
			i++;
			continue;
		}
		if (c === '`') {
			out += ' ';
			i++;
			while (i < n && src[i] !== '`') {
				if (src[i] === '\\') {
					out += '  ';
					i += 2;
					continue;
				}
				out += src[i] === '\n' ? '\n' : ' ';
				i++;
			}
			out += ' ';
			i++;
			continue;
		}
		out += c;
		i++;
	}
	return out;
}

/**
 * Collect import statements. Regex-based, which is imperfect for exotic syntax
 * but reliable for this codebase's consistent ES module style.
 *
 * `clause` forbids quotes and semicolons so a bare side-effect import
 * (`import 'leaflet/dist/leaflet.css'`) can't swallow the preceding statement's
 * default binding and misattribute it to the next module.
 */
function parseImports(rawSrc) {
	const src = stripNonCode(rawSrc);
	const out = [];
	// Dynamic imports: `import('./X')`, used by React.lazy for code splitting.
	// These are real references, so files reached only this way are NOT orphans.
	for (const m of src.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
		out.push({
			spec: m[1],
			named: [],
			hasDefault: false,
			namespace: true, // don't assert on shape of a dynamic namespace
			line: src.slice(0, m.index).split('\n').length,
			dynamic: true,
		});
	}

	const re = /\bimport\s+(?:([^'";]*?)\s+from\s+)?['"]([^'"]+)['"]/g;
	let m;
	while ((m = re.exec(src))) {
		const [, clause, spec] = m;
		const line = src.slice(0, m.index).split('\n').length;
		const named = [];
		let hasDefault = false;
		let namespace = false;

		if (clause) {
			const braced = clause.match(/\{([\s\S]*?)\}/);
			if (braced) {
				for (const part of braced[1].split(',')) {
					const name = part
						.trim()
						.split(/\s+as\s+/)[0]
						.trim();
					if (name) named.push(name);
				}
			}
			const outside = clause
				.replace(/\{[\s\S]*?\}/, '')
				.replace(/,/g, ' ')
				.trim();
			if (outside) {
				if (/^\*\s+as\s+/.test(outside)) namespace = true;
				else if (outside) hasDefault = true;
			}
		}
		out.push({ spec, named, hasDefault, namespace, line });
	}
	return out;
}

/** Collect exported binding names, plus re-export sources to follow. */
function parseExports(rawSrc) {
	const src = stripNonCode(rawSrc);
	const names = new Set();
	let hasDefault = false;
	let hasStarReexport = false;
	const reexportFrom = [];

	if (/export\s+default\s/.test(src)) hasDefault = true;

	// export [async] const/let/var/function/class NAME
	for (const m of src.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z0-9_$]+)/g)) {
		names.add(m[1]);
	}
	// export { a, b as c }  /  export { a } from './x'
	for (const m of src.matchAll(/export\s*\{([\s\S]*?)\}\s*(?:from\s*['"]([^'"]+)['"])?/g)) {
		for (const part of m[1].split(',')) {
			const seg = part.trim();
			if (!seg) continue;
			const asMatch = seg.split(/\s+as\s+/);
			const exported = (asMatch[1] || asMatch[0]).trim();
			if (exported === 'default') hasDefault = true;
			else if (exported) names.add(exported);
		}
		if (m[2]) reexportFrom.push(m[2]);
	}
	// export * from './x'
	for (const m of src.matchAll(/export\s+\*\s+(?:as\s+[A-Za-z0-9_$]+\s+)?from\s*['"]([^'"]+)['"]/g)) {
		hasStarReexport = true;
		reexportFrom.push(m[1]);
	}

	return { names, hasDefault, hasStarReexport, reexportFrom };
}

// ------------------------------------------------------------- export resolver

const exportCache = new Map();

function getExports(file, seen = new Set()) {
	if (exportCache.has(file)) return exportCache.get(file);
	if (seen.has(file)) return { names: new Set(), hasDefault: false, hasStarReexport: false };
	seen.add(file);

	if (file.endsWith('.json')) {
		const res = { names: new Set(), hasDefault: true, hasStarReexport: true };
		exportCache.set(file, res);
		return res;
	}

	const src = fs.readFileSync(file, 'utf8');
	const parsed = parseExports(src);
	const names = new Set(parsed.names);
	let starOpaque = false;

	// Follow re-export chains so `export * from` doesn't produce false positives.
	for (const spec of parsed.reexportFrom) {
		const r = resolveModule(spec, file);
		if (r.file) {
			const sub = getExports(r.file, seen);
			for (const n of sub.names) names.add(n);
			if (sub.hasStarReexport) starOpaque = true;
		} else if (r.external) {
			starOpaque = true; // re-exports from a package we can't inspect
		}
	}

	const res = { names, hasDefault: parsed.hasDefault, hasStarReexport: starOpaque };
	exportCache.set(file, res);
	return res;
}

// ------------------------------------------------------------------------ main

const files = walk(SRC).filter((f) => !SKIP_FILES.has(path.relative(PROJECT_ROOT, f).replace(/\\/g, '/')));
let importCount = 0;

for (const file of files) {
	const src = fs.readFileSync(file, 'utf8');
	const rel = path.relative(PROJECT_ROOT, file).replace(/\\/g, '/');

	for (const imp of parseImports(src)) {
		const r = resolveModule(imp.spec, file);
		if (r.external) continue;
		importCount++;

		if (r.missing) {
			errors.push(`${rel}:${imp.line}  UNRESOLVED  '${imp.spec}'`);
			continue;
		}

		const exp = getExports(r.file);
		const target = path.relative(PROJECT_ROOT, r.file).replace(/\\/g, '/');

		if (imp.hasDefault && !exp.hasDefault && !exp.hasStarReexport) {
			errors.push(`${rel}:${imp.line}  NO DEFAULT EXPORT in ${target}  ('${imp.spec}')`);
		}
		if (!exp.hasStarReexport) {
			for (const name of imp.named) {
				if (!exp.names.has(name)) {
					errors.push(`${rel}:${imp.line}  MISSING EXPORT '${name}' in ${target}`);
				}
			}
		}
	}
}

// Orphan detection: local files nobody imports (informational only —
// route entrypoints and scripts legitimately have no importers).
const imported = new Set();
for (const file of files) {
	const src = fs.readFileSync(file, 'utf8');
	for (const imp of parseImports(src)) {
		const r = resolveModule(imp.spec, file);
		if (r.file) imported.add(r.file);
	}
}
const entry = path.join(SRC, 'main.jsx');
for (const file of files) {
	if (file === entry) continue;
	if (!imported.has(file)) {
		warnings.push(path.relative(PROJECT_ROOT, file).replace(/\\/g, '/'));
	}
}

// ---------------------------------------------------------------------- report

console.log(`Scanned ${files.length} files, ${importCount} local imports.\n`);

if (warnings.length) {
	console.log(`── Unreferenced files (${warnings.length}) — expected for lazy routes/scripts:`);
	for (const w of warnings.sort()) console.log(`   · ${w}`);
	console.log('');
}

if (errors.length) {
	console.log(`── ERRORS (${errors.length}):`);
	for (const e of errors) console.log(`   ✗ ${e}`);
	console.log('\nFAIL');
	process.exit(1);
}

console.log('✓ All local imports resolve, and every named binding exists.');
