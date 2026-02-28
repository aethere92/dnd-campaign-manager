/**
 * Find orphaned mirror rows — bidirectional rows whose counterpart no longer exists.
 * These were left behind because the old trigger didn't handle DELETE or UPDATE.
 *
 * Run: node src/dev_helpers/find-orphaned-mirrors.js
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

const run = async () => {
	try {
		await client.connect();
		console.log('Connected.\n');

		// Find bidirectional rows where the reverse doesn't exist
		const { rows: orphans } = await client.query(`
			SELECT 
				er.id,
				er.from_entity_id,
				er.to_entity_id,
				er.relationship_type,
				er.is_bidirectional,
				e_from.name as from_name,
				e_from.type as from_type,
				e_to.name as to_name,
				e_to.type as to_type
			FROM entity_relationships er
			LEFT JOIN entities e_from ON e_from.id = er.from_entity_id
			LEFT JOIN entities e_to ON e_to.id = er.to_entity_id
			WHERE er.is_bidirectional = true
			AND NOT EXISTS (
				SELECT 1 FROM entity_relationships rev
				WHERE rev.from_entity_id = er.to_entity_id
				AND rev.to_entity_id = er.from_entity_id
				AND rev.is_bidirectional = true
			)
			ORDER BY er.relationship_type, e_from.name;
		`);

		// Also find: rows marked unidirectional but a bidirectional mirror still exists (stale from toggle-off)
		const { rows: staleToggles } = await client.query(`
			SELECT 
				er.id,
				er.from_entity_id,
				er.to_entity_id,
				er.relationship_type,
				er.is_bidirectional,
				e_from.name as from_name,
				e_from.type as from_type,
				e_to.name as to_name,
				e_to.type as to_type,
				rev.id as mirror_id
			FROM entity_relationships er
			JOIN entity_relationships rev
				ON rev.from_entity_id = er.to_entity_id
				AND rev.to_entity_id = er.from_entity_id
				AND rev.is_bidirectional = true
			LEFT JOIN entities e_from ON e_from.id = er.from_entity_id
			LEFT JOIN entities e_to ON e_to.id = er.to_entity_id
			WHERE er.is_bidirectional = false
			ORDER BY er.relationship_type, e_from.name;
		`);

		if (staleToggles.length > 0) {
			console.log(`⚠️  Found ${staleToggles.length} stale mirrors (row is unidirectional but bidirectional mirror still exists):\n`);
			staleToggles.forEach(o => {
				const from = o.from_name || o.from_entity_id;
				const to = o.to_name || o.to_entity_id;
				console.log(`  [${o.relationship_type}] ${from} (${o.from_type}) → ${to} (${o.to_type})  mirror_id: ${o.mirror_id}`);
			});
			console.log('');
		} else {
			console.log('✅ No stale toggle mirrors found.\n');
		}

		if (orphans.length === 0) {
			console.log('✅ No orphaned bidirectional rows found. Data is clean.');
		} else {
			console.log(`⚠️  Found ${orphans.length} orphaned bidirectional rows (missing mirror):\n`);
			orphans.forEach(o => {
				const from = o.from_name || o.from_entity_id;
				const to = o.to_name || o.to_entity_id;
				console.log(`  [${o.relationship_type}] ${from} (${o.from_type}) → ${to} (${o.to_type})  id: ${o.id}`);
			});

			console.log(`\nTo fix, you can either:`);
			console.log(`  1. Delete orphans (they're stale mirrors with no counterpart)`);
			console.log(`  2. Re-create the missing counterpart\n`);
			console.log(`Run with --fix to delete orphaned rows.`);
		}

		// If --fix flag passed, clean them up
		if (process.argv.includes('--fix') && (orphans.length > 0 || staleToggles.length > 0)) {
			// SAFETY: Dump all rows we're about to delete to a local JSON backup
			const backupPath = path.join(__dirname, 'outputs/relationship_cleanup_backup.json');
			const allIdsToDelete = [
				...orphans.map(o => o.id),
				...staleToggles.map(o => o.mirror_id),
			];
			const { rows: fullRows } = await client.query(
				`SELECT * FROM entity_relationships WHERE id = ANY($1)`,
				[allIdsToDelete]
			);
			fs.writeFileSync(backupPath, JSON.stringify(fullRows, null, 2));
			console.log(`\n💾 Backed up ${fullRows.length} rows to ${backupPath}`);

			console.log('🔧 Cleaning up...');
			// Temporarily disable triggers to avoid cascade issues during cleanup
			await client.query(`SET session_replication_role = 'replica';`);

			if (orphans.length > 0) {
				const orphanIds = orphans.map(o => o.id);
				const { rowCount: orphanCount } = await client.query(
					`DELETE FROM entity_relationships WHERE id = ANY($1)`,
					[orphanIds]
				);
				console.log(`  Deleted ${orphanCount} orphaned bidirectional rows.`);
			}

			if (staleToggles.length > 0) {
				const mirrorIds = staleToggles.map(o => o.mirror_id);
				const { rowCount: mirrorCount } = await client.query(
					`DELETE FROM entity_relationships WHERE id = ANY($1)`,
					[mirrorIds]
				);
				console.log(`  Deleted ${mirrorCount} stale mirror rows.`);
			}

			await client.query(`SET session_replication_role = 'origin';`);
			console.log('✅ Cleanup complete. Backup saved if you need to restore.');
		}

	} catch (err) {
		console.error('Error:', err.message);
	} finally {
		await client.end();
	}
};

run();
