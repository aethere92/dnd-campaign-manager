/**
 * Deploy cascade delete fix to sync_to_entities().
 * Adds relationship cleanup to the DELETE branch.
 * Run: node src/dev_helpers/deploy-cascade-delete.js
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
		console.log('🔌 Connected.\n');

		// Read and deploy the SQL
		const sqlPath = path.join(__dirname, 'sql/fix_cascade_delete.sql');
		const sql = fs.readFileSync(sqlPath, 'utf-8');

		console.log('📦 Deploying updated sync_to_entities() with cascade delete...');
		await client.query(sql);
		console.log('✅ Function updated successfully.\n');

		// Verify the function was updated by checking its source
		const { rows } = await client.query(`
			SELECT prosrc FROM pg_proc WHERE proname = 'sync_to_entities'
		`);
		if (rows.length > 0 && rows[0].prosrc.includes('entity_relationships')) {
			console.log('✅ Verified: sync_to_entities() now includes relationship cleanup.');
		} else {
			console.log('⚠️  Warning: Could not verify relationship cleanup in function source.');
		}

	} catch (err) {
		console.error('❌ Error:', err.message);
	} finally {
		await client.end();
	}
};

run();
