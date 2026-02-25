import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OUTPUT_DIR = path.join(__dirname, './outputs/encounter_narratives');

const ENCOUNTER_IDS = [
	'2d2981e4-bc33-4d54-8df6-6fb7e8209912',
	'43a48d9e-09c5-4d1f-aadf-8f3fe0288436',
	'7675dc1a-808f-4495-978e-7a4e452f2e5b',
	'77ab3aa0-dcae-46a3-9cc5-ae0e4b8c3773',
	'8af210e7-c4d5-4be9-aca5-3580a477da93',
	'a09bc4f8-dd35-4e9b-9f6e-faffd74ce4ba',
	'd0c69424-fb56-49a4-80fc-8d0b652008b4',
	'e0548e36-026a-4566-9c80-c4e7b0e3b217',
	'e9ec0f45-e9d9-4b64-a605-65a63fcde3c3'
];

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
		let effectText = effect;
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

/**
 * Create narrative sentence from a turn (multiple actions by same actor)
 */
const createTurnNarrative = (turn) => {
	if (turn.actions.length === 1) {
		return narrativizeAction(turn.actions[0]);
	}
	
	// Multiple actions - combine them into one sentence
	const narratives = turn.actions.map(action => {
		const actionDesc = action.action_description || '';
		const result = action.result || '';
		const effect = action.effect || '';
		
		let part = actionDesc.charAt(0).toLowerCase() + actionDesc.slice(1);
		
		if (result && result !== 'SUCCESS') {
			part += ` (${result.toLowerCase()})`;
		}
		
		if (effect) {
			let effectText = effect;
			if (!actionDesc.toLowerCase().includes('damage') || !effect.toLowerCase().includes('dealt')) {
				part += ` — ${effectText}`;
			} else if (effect.toLowerCase().includes('dealt') && !actionDesc.toLowerCase().includes('dealt')) {
				part += ` — ${effectText}`;
			}
		}
		
		return part;
	});
	
	// Join with "then" for better flow
	const combined = narratives.join(', then ');
	return combined.charAt(0).toUpperCase() + combined.slice(1) + '.';
};

/**
 * Process a single encounter
 */
const processEncounter = async (encounterId) => {
	console.log(`\n📖 Processing encounter: ${encounterId}`);
	
	try {
		// Fetch all actions
		const allActions = await supabaseFetch(`encounter_actions`);
		
		// Filter by encounter_id and sort
		const actions = allActions
			.filter(a => a.encounter_id === encounterId)
			.sort((a, b) => {
				if (a.round_number !== b.round_number) return a.round_number - b.round_number;
				if (a.action_order !== b.action_order) return a.action_order - b.action_order;
				return new Date(a.created_at) - new Date(b.created_at);
			});
		
		if (actions.length === 0) {
			console.log(`   ⚠️  No actions found for this encounter`);
			return null;
		}
		
		console.log(`   ✅ Found ${actions.length} actions`);
		
		// Group by rounds and turns
		const groupedActions = groupActionsByTurn(actions);
		const roundNumbers = Object.keys(groupedActions).sort((a, b) => Number(a) - Number(b));
		
		// Create narrative array
		const narrativeArray = [];
		
		roundNumbers.forEach(roundNum => {
			const turns = groupedActions[roundNum];
			
			turns.forEach((turn, index) => {
				const narrative = createTurnNarrative(turn);
				
				narrativeArray.push({
					round: Number(roundNum),
					description: narrative,
					order: index + 1
				});
			});
		});
		
		console.log(`   ✅ Generated ${narrativeArray.length} narrative entries`);
		
		return narrativeArray;
		
	} catch (error) {
		console.error(`   ❌ Error processing encounter: ${error.message}`);
		return null;
	}
};

/**
 * Main execution
 */
const run = async () => {
	try {
		console.log('🚀 Starting encounter narrative generation...');
		console.log(`   Processing ${ENCOUNTER_IDS.length} encounters`);
		
		// Create output directory if it doesn't exist
		if (!fs.existsSync(OUTPUT_DIR)) {
			fs.mkdirSync(OUTPUT_DIR, { recursive: true });
		}
		
		const results = {};
		
		for (const encounterId of ENCOUNTER_IDS) {
			const narrative = await processEncounter(encounterId);
			
			if (narrative) {
				results[encounterId] = narrative;
				
				// Save individual file
				const filename = path.join(OUTPUT_DIR, `${encounterId}.json`);
				fs.writeFileSync(filename, JSON.stringify(narrative, null, 2));
				console.log(`   💾 Saved to: ${encounterId}.json`);
			}
		}
		
		// Save combined file
		const combinedFile = path.join(OUTPUT_DIR, 'all_encounters.json');
		fs.writeFileSync(combinedFile, JSON.stringify(results, null, 2));
		
		console.log(`\n✅ COMPLETE!`);
		console.log(`   Processed: ${Object.keys(results).length}/${ENCOUNTER_IDS.length} encounters`);
		console.log(`   Output directory: ${OUTPUT_DIR}`);
		console.log(`   Combined file: all_encounters.json`);
		
	} catch (err) {
		console.error('❌ Fatal error:', err.message);
		console.error(err);
	}
};

run();
