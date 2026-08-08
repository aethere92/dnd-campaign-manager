import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load variables from .env (look in project root, not current directory)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OUTPUT_FILE = path.join(__dirname, './outputs/schema_dump.txt');

// Safety Check
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
	console.error('\n❌ CRITICAL ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env');
	process.exit(1);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Helper to fetch from Supabase REST API
 */
const supabaseFetch = async (endpoint, options = {}) => {
	const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
	const response = await fetch(url, {
		...options,
		headers: {
			'apikey': SUPABASE_KEY,
			'Authorization': `Bearer ${SUPABASE_KEY}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
	});
	
	if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
	}
	
	return response.json();
};

/**
 * Helper to truncate long text fields to 100 words
 */
const processRows = (rows) => {
	return rows.map((row) => {
		const processedRow = { ...row };
		for (const key in processedRow) {
			const val = processedRow[key];
			if (typeof val === 'string') {
				const words = val.split(/\s+/).filter(Boolean);
				if (words.length > 100) {
					processedRow[key] = words.slice(0, 100).join(' ') + '... [TRUNCATED AT 100 WORDS]';
				}
			}
		}
		return processedRow;
	});
};

const run = async () => {
	try {
		console.log('🔌 Connecting to Supabase API...');
		console.log(`   URL: ${SUPABASE_URL}`);

		let output = `=========================================\n`;
		output += `   SUPABASE API DIAGNOSTIC DUMP\n`;
		output += `   Generated: ${new Date().toLocaleString()}\n`;
		output += `   Method: REST API (Anon Key)\n`;
		output += `=========================================\n\n`;

		// Get list of tables by trying common table names or using introspection
		// Note: REST API doesn't expose schema metadata directly, so we'll try known tables
		console.log('📦 Fetching Tables...');
		
		// Try to get tables from information_schema if accessible
		const tables = [
			'campaigns',
			'characters', 
			'sessions',
			'locations',
			'npcs',
			'quests',
			'items',
			'encounters',
			'factions',
			'notes',
			'relationships'
		];

		for (const tableName of tables) {
			try {
				output += `-----------------------------------------\n`;
				output += `TABLE: ${tableName}\n`;
				output += `-----------------------------------------\n`;

				// Get sample data (limit 2)
				const data = await supabaseFetch(`${tableName}?limit=2`);
				
				if (data && data.length > 0) {
					// Get column names and infer types from first row
					const firstRow = data[0];
					const columns = Object.keys(firstRow);
					
					// Display column info with inferred types
					columns.forEach(col => {
						const value = firstRow[col];
						let type = 'unknown';
						
						if (value === null) {
							type = 'nullable';
						} else if (typeof value === 'string') {
							// Check if it's a UUID
							if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
								type = 'uuid';
							} else if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
								type = 'timestamp';
							} else {
								type = 'text';
							}
						} else if (typeof value === 'number') {
							type = Number.isInteger(value) ? 'integer' : 'numeric';
						} else if (typeof value === 'boolean') {
							type = 'boolean';
						} else if (typeof value === 'object') {
							type = 'jsonb';
						}
						
						output += `  ${col.padEnd(25)} ${type.padEnd(15)}\n`;
					});
					
					output += `\n`;
					const cleanData = processRows(data);
					output += `  -- EXAMPLE DATA (${data.length} rows) --\n`;
					output += JSON.stringify(cleanData, null, 2) + '\n';
				} else {
					output += `  -- NO DATA --\n`;
				}
				
				output += `\n`;
				console.log(`✅ ${tableName}`);
			} catch (err) {
				if (err.message.includes('404')) {
					console.log(`⚠️  ${tableName} - not found or not accessible`);
				} else {
					output += `  -- ERROR: ${err.message} --\n\n`;
					console.log(`❌ ${tableName} - ${err.message}`);
				}
			}
		}

		output += `=========================================\n`;
		output += `   LIMITATIONS (REST API)\n`;
		output += `=========================================\n\n`;
		output += `This dump uses Supabase REST API with anon key.\n`;
		output += `Column types are inferred from sample data.\n\n`;
		output += `NOT AVAILABLE via REST API:\n`;
		output += `  - RLS (Row Level Security) policies\n`;
		output += `  - Indexes and performance optimizations\n`;
		output += `  - Database functions and triggers\n`;
		output += `  - Views and their definitions\n`;
		output += `  - Foreign key relationships\n`;
		output += `  - Exact column constraints (NOT NULL, DEFAULT)\n\n`;
		output += `For complete schema information, use direct\n`;
		output += `database connection (fetch-schema.js) when\n`;
		output += `Supabase project is active.\n`;
		output += `=========================================\n`;

		fs.writeFileSync(OUTPUT_FILE, output);
		console.log(`\n✅ COMPLETE. Diagnostic saved to: ${OUTPUT_FILE}`);
	} catch (err) {
		console.error('❌ Error:', err.message);
		if (err.message.includes('fetch')) {
			console.error('\n💡 Troubleshooting Tips:');
			console.error('   1. Check your internet connection');
			console.error('   2. Verify VITE_SUPABASE_URL in .env is correct');
			console.error('   3. Check if Supabase project is paused');
		}
	}
};

run();
