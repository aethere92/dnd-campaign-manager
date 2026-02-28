/**
 * Find relationship rows that reference entities which no longer exist.
 * Run: node src/dev_helpers/find-dangling-relationships.js
 * Run: node src/dev_helpers/find-dangling-relationships.js --fix
 */
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Client } = pg;
const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

// All entity tables that could be referenced
const ENTITY_TABLES = ['characters', 'npcs', 'locations', 'factions', 'quests', 'items', 'encounters', 'sessions'];

const run = async () => {
	try {
		await client.connect();
		console.log('Connected.\n');

		// Build a set of all valid entity IDs across all tables
		let allIds = new Set();
		for (const table of ENTITY_TABLES) {
			const { rows } = await client.query(`SELECT id::text FROM ${table}`);
			rows.forEach(r => allIds.add(r.id));
		}
		// Also include session_events (from_entity_id can reference events)
		const { rows: eventRows } = await client.query(`SELECT id::text FROM session_events`);
		eventRows.forEach(r => allIds.add(r.id));

		console.log(`Total valid entity IDs: ${allIds.size}\n`);

		// Find relationships where from or to doesn't exist
		const { rows: allRels } = await client.query(`
			SELECT id, from_entity_id, to_entity_id, relationship_type, is_bidirectional
			FROM entity_relationships
		`);

		const dangling = allRels.filter(r => !allIds.has(r.from_entity_id) || !allIds.has(r.to_entity_id));

		if (dangling.length === 0) {
			console.log('✅ No dangling relationships found. All references are valid.');
		} else {
			console.log(`⚠️  Found ${dangling.length} dangling relationships:\n`);
			dangling.forEach(r => {
				const fromMissing = !allIds.has(r.from_entity_id) ? ' [MISSING]' : '';
				const toMissing = !allIds.has(r.to_entity_id) ? ' [MISSING]' : '';
				console.log(`  [${r.relationship_type}] ${r.from_entity_id}${fromMissing} → ${r.to_entity_id}${toMissing}`);
			});
		}

		if (process.argv.includes('--fix') && dangling.length > 0) {
			const backupPath = path.join(__dirname, 'outputs/dangling_relationships_backup.json');
			const ids = dangling.map(r => r.id);
			const { rows: fullRows } = await client.query(`SELECT * FROM entity_relationships WHERE id = ANY($1)`, [ids]);
			fs.writeFileSync(backupPath, JSON.stringify(fullRows, null, 2));
			console.log(`\n💾 Backed up ${fullRows.length} rows to ${backupPath}`);

			await client.query(`SET session_replication_role = 'replica';`);
			const { rowCount } = await client.query(`DELETE FROM entity_relationships WHERE id = ANY($1)`, [ids]);
			await client.query(`SET session_replication_role = 'origin';`);
			console.log(`✅ Deleted ${rowCount} dangling rows.`);
		}

	} catch (err) {
		console.error('Error:', err.message);
	} finally {
		await client.end();
	}
};

run();
