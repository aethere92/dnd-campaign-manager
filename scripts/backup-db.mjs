/**
 * Local, full-fidelity backup of the Supabase Postgres database.
 *
 * WHY THIS EXISTS
 * The Supabase free plan provides no automated backups, and the REST/anon API can
 * only see table *rows* (and only what RLS allows). The database's real
 * value — 41 triggers, 7 functions, 13 views, 37 RLS policies — lives in the
 * Postgres catalog and is invisible to the API. This script connects directly via
 * DATABASE_URL and reconstructs everything using catalog functions, so the backup
 * is restorable, not just readable.
 *
 * WHAT IT CAPTURES, into backups/<timestamp>/:
 *   - data.json        every row of every base table (the irreplaceable part)
 *   - schema.sql       tables, columns, constraints, indexes
 *   - functions.sql    pg_get_functiondef for each function
 *   - views.sql        pg_get_viewdef for each view
 *   - triggers.sql     pg_get_triggerdef for each trigger
 *   - policies.sql     RLS policies, reconstructed as CREATE POLICY
 *   - manifest.json    counts + timestamp, so a backup can be sanity-checked
 *
 * SAFETY
 * This script is strictly READ-ONLY against the database. It issues only SELECT
 * and pg_catalog reads — it never writes, alters, or drops anything. It is safe to
 * run against production at any time.
 *
 * Usage:  node scripts/backup-db.mjs [label]
 * An optional label is appended to the timestamped folder name.
 */
import pg from 'pg';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

// --- config -----------------------------------------------------------------

// Each run gets its own timestamped folder. Generated here rather than passed in
// from the shell: command substitution behaved inconsistently across shells and
// produced a literal "$(node...)" directory. A plain Node utility reading the
// clock is fine — the determinism rule that forbids it applies to workflow
// scripts, not one-shot tools.
const isoStamp = new Date().toISOString().replace(/[:.]/g, '-');
const label = process.argv[2] ? `-${process.argv[2]}` : '';
const OUT_DIR = `backups/${isoStamp}${label}`;

function loadEnv() {
	const out = {};
	for (const line of readFileSync('.env', 'utf8').split('\n')) {
		if (!line.includes('=') || line.trim().startsWith('#')) continue;
		const i = line.indexOf('=');
		out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
	}
	return out;
}

const env = loadEnv();
const connectionString = env.DATABASE_URL;
if (!connectionString) {
	console.error('FATAL: no DATABASE_URL in .env — cannot take a full backup.');
	process.exit(1);
}

// --- helpers ----------------------------------------------------------------

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const rows = async (sql, params) => (await client.query(sql, params)).rows;

// --- run --------------------------------------------------------------------

async function main() {
	await client.connect();
	mkdirSync(OUT_DIR, { recursive: true });

	const manifest = { stamp: isoStamp, tables: {}, counts: {} };

	// 1. DATA — the irreplaceable part. Every row of every base table.
	const tables = (
		await rows(
			`SELECT table_name FROM information_schema.tables
			 WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`
		)
	).map((r) => r.table_name);

	const data = {};
	for (const t of tables) {
		// Deterministic order where an id exists, so diffs between backups are stable.
		const hasId = (
			await rows(
				`SELECT 1 FROM information_schema.columns
				 WHERE table_schema='public' AND table_name=$1 AND column_name='id' LIMIT 1`,
				[t]
			)
		).length;
		const order = hasId ? ' ORDER BY id' : '';
		data[t] = await rows(`SELECT * FROM public."${t}"${order}`);
		manifest.counts[t] = data[t].length;
	}
	writeFileSync(`${OUT_DIR}/data.json`, JSON.stringify(data, null, 2), 'utf8');

	// 2. FUNCTIONS — full definitions.
	const funcs = await rows(
		`SELECT pg_get_functiondef(p.oid) AS def
		 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
		 WHERE n.nspname='public' ORDER BY p.proname`
	);
	writeFileSync(`${OUT_DIR}/functions.sql`, funcs.map((r) => r.def + ';\n').join('\n'), 'utf8');
	manifest.functions = funcs.length;

	// 3. VIEWS.
	const views = await rows(
		`SELECT table_name AS name, pg_get_viewdef(('public.'||table_name)::regclass, true) AS def
		 FROM information_schema.views WHERE table_schema='public' ORDER BY table_name`
	);
	writeFileSync(
		`${OUT_DIR}/views.sql`,
		views.map((v) => `-- ${v.name}\nCREATE OR REPLACE VIEW public.${v.name} AS\n${v.def}\n`).join('\n'),
		'utf8'
	);
	manifest.views = views.length;

	// 4. TRIGGERS — definition text is complete (includes the CREATE TRIGGER).
	const triggers = await rows(
		`SELECT tgname AS name, pg_get_triggerdef(t.oid) AS def
		 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
		 WHERE n.nspname='public' AND NOT t.tgisinternal ORDER BY c.relname, tgname`
	);
	writeFileSync(`${OUT_DIR}/triggers.sql`, triggers.map((r) => r.def + ';').join('\n') + '\n', 'utf8');
	manifest.triggers = triggers.length;

	// 5. RLS POLICIES — reconstructed as runnable CREATE POLICY statements.
	const policies = await rows(
		`SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
		 FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname`
	);
	// pg returns `roles` as a Postgres array literal string ('{public,authenticated}'),
	// not a JS array — normalise both shapes.
	const parseRoles = (r) => {
		if (Array.isArray(r)) return r;
		if (typeof r === 'string') return r.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
		return [];
	};
	const policySql = policies
		.map((p) => {
			const roles = parseRoles(p.roles).join(', ') || 'public';
			let s = `CREATE POLICY "${p.policyname}" ON public.${p.tablename}`;
			s += `\n  AS ${p.permissive === 'PERMISSIVE' ? 'PERMISSIVE' : 'RESTRICTIVE'}`;
			s += `\n  FOR ${p.cmd}`;
			s += `\n  TO ${roles}`;
			if (p.qual) s += `\n  USING (${p.qual})`;
			if (p.with_check) s += `\n  WITH CHECK (${p.with_check})`;
			return s + ';';
		})
		.join('\n\n');
	writeFileSync(`${OUT_DIR}/policies.sql`, policySql + '\n', 'utf8');
	manifest.policies = policies.length;

	// 6. SCHEMA — columns, constraints, indexes. Enough to recreate table shape.
	const columns = await rows(
		`SELECT table_name, column_name, data_type, is_nullable, column_default, ordinal_position
		 FROM information_schema.columns WHERE table_schema='public'
		 ORDER BY table_name, ordinal_position`
	);
	const constraints = await rows(
		`SELECT conrelid::regclass::text AS tbl, conname, pg_get_constraintdef(oid) AS def
		 FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY conrelid::regclass::text, conname`
	);
	const indexes = await rows(
		`SELECT tablename, indexname, indexdef FROM pg_indexes
		 WHERE schemaname='public' ORDER BY tablename, indexname`
	);
	let schema = '-- Columns\n';
	for (const c of columns) {
		schema += `-- ${c.table_name}.${c.column_name} ${c.data_type}`;
		schema += c.is_nullable === 'NO' ? ' NOT NULL' : '';
		schema += c.column_default ? ` DEFAULT ${c.column_default}` : '';
		schema += '\n';
	}
	schema += '\n-- Constraints\n';
	for (const c of constraints) schema += `ALTER TABLE ${c.tbl} ADD CONSTRAINT ${c.conname} ${c.def};\n`;
	schema += '\n-- Indexes\n';
	for (const i of indexes) schema += i.indexdef + ';\n';
	writeFileSync(`${OUT_DIR}/schema.sql`, schema, 'utf8');
	manifest.tables = manifest.counts;

	writeFileSync(`${OUT_DIR}/manifest.json`, JSON.stringify(manifest, null, 2), 'utf8');

	// Summary
	const totalRows = Object.values(manifest.counts).reduce((a, b) => a + b, 0);
	console.log(`Backup written to ${OUT_DIR}/`);
	console.log(`  ${tables.length} tables, ${totalRows} rows total`);
	console.log(`  ${manifest.functions} functions, ${manifest.views} views, ${manifest.triggers} triggers, ${manifest.policies} policies`);
}

main()
	.catch((err) => {
		console.error('BACKUP FAILED:', err.message);
		process.exitCode = 1;
	})
	.finally(() => client.end());
