import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load variables from .env
dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, './outputs/schema_dump.txt');

// Safety Check
if (!process.env.DATABASE_URL) {
	console.error('\n❌ CRITICAL ERROR: DATABASE_URL is missing from .env');
	process.exit(1);
}

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const run = async () => {
	try {
		console.log('🔌 Connecting to Database...');
		await client.connect();
		console.log('✅ Connected.');

		let output = `=========================================\n`;
		output += `   SUPABASE FULL DIAGNOSTIC DUMP (V3)\n`;
		output += `   Generated: ${new Date().toLocaleString()}\n`;
		output += `=========================================\n\n`;

		// --- 1. TABLES & DATA SAMPLES ---
		console.log('📦 Fetching Tables & Samples...');

		const tablesRes = await client.query(`
      SELECT 
        c.relname as table_name,
        c.relrowsecurity as rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY c.relname;
    `);

		for (const row of tablesRes.rows) {
			const rlsStatus = row.rls_enabled ? '[🔒 RLS ENABLED]' : '[⚠️ RLS DISABLED]';
			output += `-----------------------------------------\n`;
			output += `TABLE: ${row.table_name} ${rlsStatus}\n`;
			output += `-----------------------------------------\n`;

			// Get Columns
			const cols = await client.query(
				`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `,
				[row.table_name]
			);

			cols.rows.forEach((col) => {
				const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : '';
				const def = col.column_default ? `DEFAULT ${col.column_default}` : '';
				output += `  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} ${nullable} ${def}\n`;
			});

			// Get Sample Data
			try {
				const samples = await client.query(`SELECT * FROM "${row.table_name}" LIMIT 2`);
				if (samples.rows.length > 0) {
					output += `\n  -- EXAMPLE DATA (${samples.rows.length} rows) --\n`;
					output += JSON.stringify(samples.rows, null, 2) + '\n';
				} else {
					output += `\n  -- NO DATA --\n`;
				}
			} catch (err) {
				output += `\n  -- ERROR FETCHING DATA: ${err.message} --\n`;
			}

			output += `\n`;
		}

		// --- 2. INDEXES ---
		console.log('🚀 Fetching Indexes...');
		output += `=========================================\n`;
		output += `   PERFORMANCE INDEXES\n`;
		output += `=========================================\n\n`;

		const indexesRes = await client.query(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

		for (const idx of indexesRes.rows) {
			output += `TABLE: ${idx.tablename}\n`;
			output += `  ${idx.indexdef}\n\n`;
		}

		// --- 3. RLS POLICIES ---
		console.log('🛡️  Fetching RLS Policies...');
		output += `=========================================\n`;
		output += `   SECURITY POLICIES (RLS)\n`;
		output += `=========================================\n\n`;

		const policiesRes = await client.query(`
      SELECT tablename, policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

		if (policiesRes.rows.length === 0) {
			output += `No RLS Policies found.\n\n`;
		} else {
			for (const pol of policiesRes.rows) {
				output += `TABLE: ${pol.tablename} | POLICY: ${pol.policyname}\n`;
				output += `  COMMAND: ${pol.cmd}\n`;
				output += `  USING: ${pol.qual}\n`;
				if (pol.with_check) output += `  WITH CHECK: ${pol.with_check}\n`;
				output += `\n`;
			}
		}

		// --- 4. VIEWS & SAMPLES ---
		console.log('👁️  Fetching Views & Samples...');
		output += `=========================================\n`;
		output += `   VIEWS\n`;
		output += `=========================================\n\n`;
		const viewsRes = await client.query(`
      SELECT table_name, view_definition
      FROM information_schema.views
      WHERE table_schema = 'public';
    `);

		for (const view of viewsRes.rows) {
			output += `VIEW: ${view.table_name}\n`;
			output += `-----------------------------------------\n`;
			output += `${view.view_definition.replace(/\n\s+/g, '\n  ')}\n`;

			// Get Sample Data for View
			try {
				const samples = await client.query(`SELECT * FROM "${view.table_name}" LIMIT 2`);
				if (samples.rows.length > 0) {
					output += `\n  -- VIEW EXAMPLE RESULT --\n`;
					output += JSON.stringify(samples.rows, null, 2) + '\n';
				}
			} catch (err) {
				output += `\n  -- ERROR READING VIEW: ${err.message} --\n`;
			}
			output += `\n`;
		}

		// --- 5. FUNCTIONS ---
		console.log('⚡ Fetching Functions...');
		output += `=========================================\n`;
		output += `   FUNCTIONS\n`;
		output += `=========================================\n\n`;
		const funcsRes = await client.query(`
      SELECT 
        p.proname as name, 
        pg_get_function_arguments(p.oid) as args,
        p.prosrc as source
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname NOT LIKE 'pg_%' 
      AND p.proname NOT LIKE 'gs_%';
    `);

		for (const func of funcsRes.rows) {
			output += `FUNCTION: ${func.name}(${func.args})\n`;
			output += `-----------------------------------------\n`;
			output += `${func.source}\n\n`;
		}

		// --- 6. TRIGGERS ---
		console.log('🔫 Fetching Triggers...');
		output += `=========================================\n`;
		output += `   TRIGGERS\n`;
		output += `=========================================\n\n`;
		const triggersRes = await client.query(`
      SELECT 
        event_object_table as table_name,
        trigger_name,
        action_timing,
        event_manipulation,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `);

		for (const trig of triggersRes.rows) {
			output += `TRIGGER: ${trig.trigger_name} ON ${trig.table_name}\n`;
			output += `${trig.action_timing} ${trig.event_manipulation}\n`;
			output += `EXECUTE: ${trig.action_statement}\n\n`;
		}

		fs.writeFileSync(OUTPUT_FILE, output);
		console.log(`✅ COMPLETE. Full Diagnostic saved to: ${OUTPUT_FILE}`);
	} catch (err) {
		console.error('❌ Error:', err.message);
	} finally {
		await client.end();
	}
};

run();
