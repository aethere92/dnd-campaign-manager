import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const OUTPUT_FILE = path.join(__dirname, './outputs/all_encounters_raw.json');

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

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
	console.error('\n❌ CRITICAL ERROR: Missing env vars');
	process.exit(1);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseFetch = async (endpoint) => {
	const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
	const response = await fetch(url, {
		headers: {
			'apikey': SUPABASE_KEY,
			'Authorization': `Bearer ${SUPABASE_KEY}`,
			'Content-Type': 'application/json',
		},
	});
	
	if (!response.ok) throw new Error(`API Error: ${response.status}`);
	return response.json();
};

const groupActionsByTurn = (actions) => {
	const rounds = {};
	
	actions.forEach(action => {
		const round = action.round_number || 1;
		const actor = action.actor_name || 'Unknown';
		
		if (!rounds[round]) rounds[round] = [];
		
		const lastTurn = rounds[round][rounds[round].length - 1];
		if (lastTurn && lastTurn.actor === actor) {
			lastTurn.actions.push(action);
		} else {
			rounds[round].push({ actor, actions: [action] });
		}
	});
	
	return rounds;
};

const run = async () => {
	console.log('🔍 Fetching all encounter data...');
	
	const allActions = await supabaseFetch(`encounter_actions`);
	const encounters = {};
	
	for (const encounterId of ENCOUNTER_IDS) {
		const actions = allActions
			.filter(a => a.encounter_id === encounterId)
			.sort((a, b) => {
				if (a.round_number !== b.round_number) return a.round_number - b.round_number;
				if (a.action_order !== b.action_order) return a.action_order - b.action_order;
				return new Date(a.created_at) - new Date(b.created_at);
			});
		
		if (actions.length > 0) {
			encounters[encounterId] = {
				total_actions: actions.length,
				grouped: groupActionsByTurn(actions)
			};
			console.log(`✅ ${encounterId}: ${actions.length} actions`);
		}
	}
	
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(encounters, null, 2));
	console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
};

run();
