import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OUTPUT_FILE = path.join(__dirname, './outputs/encounter_narrative.txt');
const ENCOUNTER_ID = 'e9ec0f45-e9d9-4b64-a605-65a63fcde3c3';

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
 * Narrativize an action
 */
const narrativizeAction = (action) => {
	const actor = action.actor_name || 'Unknown';
	const target = action.target_name;
	const actionType = action.action_type || 'action';
	const actionDesc = action.action_description || '';
	const result = action.result || '';
	const effect = action.effect || '';
	
	// Start with action description (lowercase first letter)
	let narrative = actionDesc.charAt(0).toLowerCase() + actionDesc.slice(1);
	
	// Add result if meaningful
	if (result && result !== 'SUCCESS') {
		narrative += ` (${result.toLowerCase()})`;
	}
	
	// Add effect if present
	if (effect) {
		// Clean up the effect text
		let effectText = effect;
		// Remove redundant information already in description
		if (!actionDesc.toLowerCase().includes('damage') || !effect.toLowerCase().includes('dealt')) {
			narrative += ` — ${effectText}`;
		} else if (effect.toLowerCase().includes('dealt') && !actionDesc.toLowerCase().includes('dealt')) {
			narrative += ` — ${effectText}`;
		}
	}
	
	return narrative.charAt(0).toUpperCase() + narrative.slice(1) + '.';
};

/**
 * Group actions by round and turn - combining consecutive actions by same actor
 */
const groupActionsByTurn = (actions) => {
	const rounds = {};
	
	actions.forEach(action => {
		const round = action.round_number || 1;
		const actor = action.actor_name || 'Unknown';
		
		if (!rounds[round]) {
			rounds[round] = [];
		}
		
		// Check if the last turn in this round is for the same actor
		const lastTurn = rounds[round][rounds[round].length - 1];
		if (lastTurn && lastTurn.actor === actor) {
			// Add to existing turn
			lastTurn.actions.push(action);
		} else {
			// Create new turn
			rounds[round].push({
				actor,
				actions: [action]
			});
		}
	});
	
	return rounds;
};

const run = async () => {
	try {
		console.log('🔌 Fetching encounter actions...');
		console.log(`   Encounter ID: ${ENCOUNTER_ID}`);

		// Fetch all actions (ordering might be causing issues)
		console.log('Fetching all actions...');
		const allActions = await supabaseFetch(`encounter_actions`);
		console.log(`✅ Found ${allActions.length} total actions`);
		
		// Filter by encounter_id and sort
		const actions = allActions
			.filter(a => a.encounter_id === ENCOUNTER_ID)
			.sort((a, b) => {
				if (a.round_number !== b.round_number) return a.round_number - b.round_number;
				if (a.action_order !== b.action_order) return a.action_order - b.action_order;
				return new Date(a.created_at) - new Date(b.created_at);
			});
		
		console.log(`✅ Found ${actions.length} actions for this encounter`);
		
		// Save raw data
		let output = `=========================================\n`;
		output += `   ENCOUNTER ACTIONS - RAW DATA\n`;
		output += `   Encounter ID: ${ENCOUNTER_ID}\n`;
		output += `   Generated: ${new Date().toLocaleString()}\n`;
		output += `=========================================\n\n`;
		output += JSON.stringify(actions, null, 2);
		output += `\n\n`;
		
		// Generate narrative
		output += `=========================================\n`;
		output += `   ENCOUNTER NARRATIVE\n`;
		output += `=========================================\n\n`;
		
		const groupedActions = groupActionsByTurn(actions);
		const roundNumbers = Object.keys(groupedActions).sort((a, b) => Number(a) - Number(b));
		
		roundNumbers.forEach(roundNum => {
			output += `--- ROUND ${roundNum} ---\n\n`;
			
			const turns = groupedActions[roundNum];
			
			turns.forEach(turn => {
				output += `${turn.actor}'s Turn:\n`;
				
				turn.actions.forEach(action => {
					const narrative = narrativizeAction(action);
					output += `  • ${narrative}\n`;
				});
				
				output += `\n`;
			});
		});

		fs.writeFileSync(OUTPUT_FILE, output);
		console.log(`\n✅ COMPLETE. Narrative saved to: ${OUTPUT_FILE}`);
		
		// Also create a clean narrative-only version
		const NARRATIVE_ONLY_FILE = path.join(__dirname, './outputs/encounter_narrative_clean.txt');
		let cleanOutput = `=========================================\n`;
		cleanOutput += `   ENCOUNTER NARRATIVE\n`;
		cleanOutput += `   Encounter ID: ${ENCOUNTER_ID}\n`;
		cleanOutput += `   Generated: ${new Date().toLocaleString()}\n`;
		cleanOutput += `=========================================\n\n`;
		
		roundNumbers.forEach(roundNum => {
			cleanOutput += `--- ROUND ${roundNum} ---\n\n`;
			
			const turns = groupedActions[roundNum];
			
			turns.forEach(turn => {
				cleanOutput += `${turn.actor}'s Turn:\n`;
				
				turn.actions.forEach(action => {
					const narrative = narrativizeAction(action);
					cleanOutput += `  • ${narrative}\n`;
				});
				
				cleanOutput += `\n`;
			});
		});
		
		fs.writeFileSync(NARRATIVE_ONLY_FILE, cleanOutput);
		console.log(`✅ Clean narrative saved to: ${NARRATIVE_ONLY_FILE}`);
	} catch (err) {
		console.error('❌ Error:', err.message);
		console.error(err);
	}
};

run();
