/**
 * Removes unused import specifiers reported by ESLint's no-unused-vars.
 *
 * Parses each file with espree (ESLint's own parser) and rebuilds the affected
 * import statements from the AST, rather than pattern-matching on text — the
 * imports here span multiple lines and mix default/named specifiers, which is
 * exactly where regex edits corrupt code.
 *
 * Only import specifiers are touched. Unused *local* variables are left alone:
 * deciding whether an unused local is dead code or a missing use needs a human.
 *
 * Usage:
 *   npx eslint . -f json > lint.json
 *   node scripts/prune-unused-imports.mjs lint.json [--apply]
 *
 * Without --apply it prints the planned edits and changes nothing. The report is
 * read from a file rather than shelled out to, because spawning the `npx.cmd`
 * shim from Node on Windows fails with EINVAL.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import * as espree from 'espree';

const APPLY = process.argv.includes('--apply');

const PARSE_OPTIONS = {
	ecmaVersion: 'latest',
	sourceType: 'module',
	ecmaFeatures: { jsx: true },
	range: true,
};

const reportPath = process.argv[2];
if (!reportPath || reportPath.startsWith('--')) {
	console.error('Usage: npx eslint . -f json > lint.json && node scripts/prune-unused-imports.mjs lint.json [--apply]');
	process.exit(1);
}

/** Rebuild an import statement containing only the surviving specifiers. */
function renderImport(decl, source, keep) {
	const quote = source[decl.source.range[0]];
	const from = `${quote}${decl.source.value}${quote}`;

	const defaultSpec = keep.find((s) => s.type === 'ImportDefaultSpecifier');
	const namespaceSpec = keep.find((s) => s.type === 'ImportNamespaceSpecifier');
	const named = keep.filter((s) => s.type === 'ImportSpecifier');

	const clauses = [];
	if (defaultSpec) clauses.push(defaultSpec.local.name);
	if (namespaceSpec) clauses.push(`* as ${namespaceSpec.local.name}`);
	if (named.length) {
		const parts = named.map((s) =>
			s.imported.name === s.local.name ? s.local.name : `${s.imported.name} as ${s.local.name}`
		);
		clauses.push(`{ ${parts.join(', ')} }`);
	}

	return `import ${clauses.join(', ')} from ${from};`;
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
let filesChanged = 0;
let specifiersRemoved = 0;
const skipped = [];

for (const file of report) {
	const unused = file.messages.filter((m) => m.ruleId === 'no-unused-vars');
	if (!unused.length) continue;

	const source = readFileSync(file.filePath, 'utf8');
	let ast;
	try {
		ast = espree.parse(source, PARSE_OPTIONS);
	} catch (err) {
		skipped.push(`${file.filePath}: parse failed (${err.message})`);
		continue;
	}

	const imports = ast.body.filter((n) => n.type === 'ImportDeclaration');

	// Map each reported name to the import specifier that declares it, if any.
	const namesToDrop = new Set();
	for (const msg of unused) {
		const name = /'([^']+)'/.exec(msg.message)?.[1];
		if (!name) continue;

		const owner = imports.find((imp) => imp.specifiers.some((s) => s.local.name === name));
		if (owner) namesToDrop.add(name);
		else skipped.push(`${file.filePath}:${msg.line} ${name} (not an import — left for review)`);
	}
	if (!namesToDrop.size) continue;

	// Build edits back-to-front so earlier ranges stay valid.
	const edits = [];
	for (const decl of imports) {
		const keep = decl.specifiers.filter((s) => !namesToDrop.has(s.local.name));
		if (keep.length === decl.specifiers.length) continue;

		specifiersRemoved += decl.specifiers.length - keep.length;
		const [start, end] = decl.range;

		if (keep.length === 0) {
			// Drop the whole statement, including the newline it sat on.
			let cut = end;
			while (cut < source.length && source[cut] !== '\n') cut++;
			edits.push({ start, end: Math.min(cut + 1, source.length), text: '' });
		} else {
			edits.push({ start, end, text: renderImport(decl, source, keep) });
		}
	}
	if (!edits.length) continue;

	let next = source;
	for (const e of edits.sort((a, b) => b.start - a.start)) {
		next = next.slice(0, e.start) + e.text + next.slice(e.end);
	}

	filesChanged++;
	if (APPLY) writeFileSync(file.filePath, next, 'utf8');
}

console.log(
	`${APPLY ? 'Rewrote' : 'Would rewrite'} ${filesChanged} files, removing ${specifiersRemoved} import specifiers.`
);
if (skipped.length) {
	console.log(`\nLeft alone (${skipped.length}):`);
	for (const s of skipped) console.log('  ' + s.replace(/.*dnd-campaign-manager-main[\\/]/, ''));
}
if (!APPLY) console.log('\nDry run. Re-run with --apply to write.');
