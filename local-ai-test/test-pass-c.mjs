/**
 * PASS C TEST — relationship classification with a local model.
 *
 * The point of this script is NOT to import anything. It is to measure whether a
 * local model can reproduce relationship decisions you already made by hand.
 *
 * It:
 *   1. pulls one session (narrative + the entities you linked to it) from Supabase
 *   2. generates candidate entity pairs deterministically (co-occurrence)
 *   3. asks the local model to classify each pair, with NONE as a real option
 *   4. scores the result against the relationships already in your database
 *
 * Nothing is written. Read-only against Supabase, and the model runs locally.
 *
 * Usage:
 *   node test-pass-c.mjs --session <uuid> [--model granite4.1:8b] [--limit 40] [--verbose]
 *   node test-pass-c.mjs --list        # show recent sessions and their ids
 */

import fs from 'fs';
import path from 'path';
import { renderVocabulary, RELATIONSHIP_TYPES } from './relationship-vocabulary.mjs';

// ---------------------------------------------------------------- config

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
	const i = args.indexOf(`--${name}`);
	return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const hasFlag = (name) => args.includes(`--${name}`);

const MODEL = getArg('model', 'granite4.1:8b');
const OLLAMA = getArg('ollama', 'http://localhost:11434');
const SESSION_ID = getArg('session');
const LIMIT = parseInt(getArg('limit', '0'), 10); // 0 = no limit
const VERBOSE = hasFlag('verbose');

// .env lives one level up (project root). Minimal parser — no dotenv dependency.
function loadEnv() {
	const envPath = path.resolve(import.meta.dirname, '../.env');
	if (!fs.existsSync(envPath)) {
		console.error(`\n[X] No .env found at ${envPath}`);
		console.error('    It needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n');
		process.exit(1);
	}
	const out = {};
	for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
	}
	return out;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error('\n[X] .env is missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY\n');
	process.exit(1);
}

const sb = async (endpoint) => {
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
		headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
	});
	if (!res.ok) throw new Error(`Supabase ${res.status} ${res.statusText} on ${endpoint}`);
	return res.json();
};

// ---------------------------------------------------------------- preflight

async function checkOllama() {
	try {
		const res = await fetch(`${OLLAMA}/api/tags`);
		if (!res.ok) throw new Error(`${res.status}`);
		const { models = [] } = await res.json();
		const names = models.map((m) => m.name);
		if (!names.some((n) => n === MODEL || n.startsWith(MODEL.split(':')[0]))) {
			console.error(`\n[X] Model "${MODEL}" not found. Installed: ${names.join(', ') || '(none)'}`);
			console.error(`    Run:  ollama pull ${MODEL}\n`);
			process.exit(1);
		}
		console.log(`[ok] Ollama reachable, model "${MODEL}" present`);
	} catch {
		console.error(`\n[X] Cannot reach Ollama at ${OLLAMA}`);
		console.error('    Is it running? Try:  ollama serve\n');
		process.exit(1);
	}
}

// ---------------------------------------------------------------- data

async function listSessions() {
	const rows = await sb('sessions?select=id,title,attributes&limit=200');
	const sorted = rows
		.map((r) => ({ id: r.id, title: r.title, num: Number(r.attributes?.session_number ?? 0) }))
		.sort((a, b) => b.num - a.num);
	console.log('\nSessions (newest first):\n');
	for (const s of sorted) console.log(`  ${String(s.num).padStart(3)}  ${s.id}  ${s.title}`);
	console.log('\nPick one with rich relationships:  node test-pass-c.mjs --session <uuid>\n');
}

async function loadSession(id) {
	const rows = await sb(`sessions?id=eq.${id}&select=id,title,narrative,attributes`);
	if (!rows.length) throw new Error(`No session with id ${id}`);
	return rows[0];
}

/** Entities mentioned in this session — the cast list pass A would have produced. */
async function loadSessionCast(sessionId) {
	const rels = await sb(
		`entity_relationships?from_entity_id=eq.${sessionId}&select=to_entity_id,relationship_type,target:entities!to_entity_id(id,name,type)`
	);
	const cast = [];
	const seen = new Set();
	for (const r of rels) {
		const t = r.target;
		if (t && !seen.has(t.id)) {
			seen.add(t.id);
			cast.push({ id: t.id, name: t.name, type: t.type });
		}
	}

	// Pull aliases so "Soranna" matches the entity named "Captain Soranna".
	// Without this, pair generation silently drops relationships whose entity is
	// referred to by a short form in the paragraph that matters.
	if (cast.length) {
		try {
			const idx = await sb(`view_entity_index?id=in.(${cast.map((c) => c.id).join(',')})&select=id,name,aliases`);
			const aliasById = new Map(idx.map((r) => [r.id, r.aliases]));
			for (const c of cast) {
				const raw = aliasById.get(c.id);
				const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').map((s) => s.trim()) : [];
				// Longest first, so "Captain Soranna" wins over "Soranna".
				c.terms = [c.name, ...list.filter(Boolean)].sort((a, b) => b.length - a.length);
			}
		} catch {
			for (const c of cast) c.terms = [c.name];
		}
	}
	return cast;
}

/** Ground truth: entity->entity relationships among the cast, excluding the session itself. */
async function loadGroundTruth(cast) {
	const ids = cast.map((c) => c.id);
	if (!ids.length) return [];
	const inList = `(${ids.join(',')})`;
	const rels = await sb(
		`entity_relationships?from_entity_id=in.${inList}&select=from_entity_id,to_entity_id,relationship_type`
	);
	const castIds = new Set(ids);
	return rels.filter((r) => castIds.has(r.to_entity_id));
}

// ---------------------------------------------------------------- candidate pairs

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Deterministic pair generation: entities whose names (or aliases) co-occur
 * within a sliding window of paragraphs. No judgement here — just "these two
 * were mentioned near each other, is there a relationship?" The model decides.
 *
 * Word-boundary matching mirrors the app's smart-text system, so "Norr" does not
 * match inside "Norrington", and aliases are honoured.
 */
function buildCandidatePairs(narrative, cast, windowSize = 2) {
	const paragraphs = narrative.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
	const pairs = new Map();

	const mentions = (text, entity) =>
		(entity.terms || [entity.name]).some((term) => new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(text));

	// Slide a window so a relationship stated across a paragraph break is still
	// caught (e.g. the NPC is named in one paragraph, the place in the next).
	for (let start = 0; start < paragraphs.length; start++) {
		const window = paragraphs.slice(start, start + windowSize);
		const text = window.join('\n\n');
		const present = cast.filter((e) => mentions(text, e));

		for (let i = 0; i < present.length; i++) {
			for (let j = i + 1; j < present.length; j++) {
				const [a, b] = [present[i], present[j]];
				const key = [a.id, b.id].sort().join('|');
				if (!pairs.has(key)) pairs.set(key, { a, b, contexts: [] });
				const ctx = pairs.get(key).contexts;
				if (!ctx.includes(text)) ctx.push(text);
			}
		}
	}
	return [...pairs.values()];
}

// ---------------------------------------------------------------- the model call

const SCHEMA = {
	type: 'object',
	properties: {
		relationship_type: { type: 'string', enum: [...RELATIONSHIP_TYPES, 'NONE'] },
		direction: { type: 'string', enum: ['A_to_B', 'B_to_A'] },
		confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
		because: { type: 'string' },
	},
	required: ['relationship_type', 'direction', 'confidence', 'because'],
};

const VOCAB = renderVocabulary();

function buildPrompt(pair, narrativeExcerpt) {
	return `You are cataloguing a Dungeons & Dragons campaign. Decide whether a PERSISTENT, EXPLICITLY SUPPORTED relationship exists between two entities.

RELATIONSHIP TYPES:
${VOCAB}

CRITICAL RULES:
1. Answer NONE unless the text explicitly supports a relationship. Most pairs are NONE.
2. Two entities appearing in the same paragraph is NOT a relationship. A passer-by mentioned near a town does NOT belong to that town.
3. Prefer the weaker type when unsure: "encountered" over "located_in", "located_in" over "residence_relation".
4. parent_location requires BOTH entities to be locations.
5. "direction" says which entity is the subject: A_to_B means (A)-[type]->(B).
6. "because" must QUOTE the specific words that justify it. If you cannot quote, answer NONE.

ENTITY A: ${pair.a.name} (${pair.a.type})
ENTITY B: ${pair.b.name} (${pair.b.type})

TEXT:
${narrativeExcerpt}

Return JSON only.`;
}

async function classify(pair) {
	const excerpt = pair.contexts.slice(0, 2).join('\n\n');
	const res = await fetch(`${OLLAMA}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			stream: false,
			format: SCHEMA,
			options: { temperature: 0 }, // deterministic — rerun gives the same answer
			messages: [{ role: 'user', content: buildPrompt(pair, excerpt) }],
		}),
	});
	if (!res.ok) throw new Error(`Ollama ${res.status}`);
	const body = await res.json();
	try {
		return JSON.parse(body.message.content);
	} catch {
		return { relationship_type: 'PARSE_ERROR', direction: 'A_to_B', confidence: 'low', because: '' };
	}
}

// ---------------------------------------------------------------- main

async function main() {
	if (hasFlag('list')) return listSessions();

	if (!SESSION_ID) {
		console.error('\nUsage: node test-pass-c.mjs --session <uuid>');
		console.error('       node test-pass-c.mjs --list\n');
		process.exit(1);
	}

	await checkOllama();

	const session = await loadSession(SESSION_ID);
	const cast = await loadSessionCast(SESSION_ID);
	const truth = await loadGroundTruth(cast);

	console.log(`\nSession : ${session.title}`);
	console.log(`Narrative: ~${session.narrative?.split(/\s+/).length ?? 0} words`);
	console.log(`Cast     : ${cast.length} entities`);
	console.log(`Existing entity-to-entity relationships: ${truth.length}`);

	if (!session.narrative) {
		console.error('\n[X] This session has no narrative text.\n');
		process.exit(1);
	}
	if (cast.length < 2) {
		console.error('\n[X] Fewer than 2 linked entities — pick a session with more.\n');
		process.exit(1);
	}

	let pairs = buildCandidatePairs(session.narrative, cast);
	console.log(`Candidate pairs (co-occurring): ${pairs.length}`);
	if (LIMIT > 0 && pairs.length > LIMIT) {
		pairs = pairs.slice(0, LIMIT);
		console.log(`  (limited to ${LIMIT} for this run)`);
	}

	// Ground-truth lookup, direction-insensitive for scoring.
	const truthMap = new Map();
	for (const r of truth) {
		truthMap.set([r.from_entity_id, r.to_entity_id].sort().join('|'), r.relationship_type);
	}

	console.log(`\nClassifying with ${MODEL} (temperature 0)...\n`);
	const t0 = Date.now();

	const results = [];
	for (let i = 0; i < pairs.length; i++) {
		const pair = pairs[i];
		const out = await classify(pair);
		const key = [pair.a.id, pair.b.id].sort().join('|');
		const expected = truthMap.get(key) ?? 'NONE';
		const got = out.relationship_type;

		results.push({ pair, out, expected, got, exact: got === expected });

		process.stdout.write(`\r  ${i + 1}/${pairs.length}  (${Math.round(((i + 1) / pairs.length) * 100)}%)   `);

		if (VERBOSE) {
			const mark = got === expected ? 'MATCH' : 'DIFF ';
			console.log(
				`\n  [${mark}] ${pair.a.name} <-> ${pair.b.name}\n` +
					`          expected: ${expected}\n` +
					`          model   : ${got} (${out.confidence})\n` +
					`          because : ${out.because}`
			);
		}
	}

	const secs = ((Date.now() - t0) / 1000).toFixed(1);
	console.log(`\n\nDone in ${secs}s  (${(secs / pairs.length).toFixed(2)}s per pair)\n`);

	// ------------------------------------------------------------ scoring
	// Framed as: would this have SAVED you work, or CREATED work?

	const truePos = results.filter((r) => r.expected !== 'NONE' && r.got !== 'NONE');
	const exactHits = truePos.filter((r) => r.exact);
	const wrongType = truePos.filter((r) => !r.exact);
	const missed = results.filter((r) => r.expected !== 'NONE' && r.got === 'NONE');
	const spurious = results.filter((r) => r.expected === 'NONE' && r.got !== 'NONE');
	const correctNone = results.filter((r) => r.expected === 'NONE' && r.got === 'NONE');
	const parseErrors = results.filter((r) => r.got === 'PARSE_ERROR');

	const pct = (n, d) => (d === 0 ? 'n/a' : `${Math.round((n / d) * 100)}%`);

	console.log('='.repeat(64));
	console.log('RESULTS');
	console.log('='.repeat(64));
	console.log(`  Pairs classified            ${results.length}`);
	console.log(`  Correctly said NONE         ${correctNone.length}   <- avoided noise`);
	console.log(`  Found + right type          ${exactHits.length}`);
	console.log(`  Found + WRONG type          ${wrongType.length}   <- you'd fix the dropdown`);
	console.log(`  MISSED (said NONE)          ${missed.length}   <- you'd add by hand`);
	console.log(`  SPURIOUS (invented)         ${spurious.length}   <- you'd reject`);
	if (parseErrors.length) console.log(`  Parse errors                ${parseErrors.length}`);
	console.log('-'.repeat(64));
	console.log(
		`  Precision (proposals right) ${pct(exactHits.length, exactHits.length + wrongType.length + spurious.length)}`
	);
	console.log(
		`  Recall (of what you made)   ${pct(exactHits.length + wrongType.length, truePos.length + missed.length)}`
	);
	console.log('='.repeat(64));

	if (missed.length) {
		console.log('\nMISSED — model said NONE, you had a relationship:');
		for (const r of missed.slice(0, 15)) {
			console.log(`  ${r.pair.a.name} -> ${r.pair.b.name}  (you: ${r.expected})`);
		}
	}
	if (wrongType.length) {
		console.log('\nWRONG TYPE — right that a link exists, wrong which:');
		for (const r of wrongType.slice(0, 15)) {
			console.log(
				`  ${r.pair.a.name} -> ${r.pair.b.name}\n      you: ${r.expected}   model: ${r.got}\n      "${r.out.because}"`
			);
		}
	}
	if (spurious.length) {
		console.log('\nSPURIOUS — model invented a link you did not make:');
		for (const r of spurious.slice(0, 15)) {
			console.log(
				`  ${r.pair.a.name} -> ${r.pair.b.name}  (model: ${r.got}, ${r.out.confidence})\n      "${r.out.because}"`
			);
		}
	}

	const outPath = path.resolve(import.meta.dirname, `pass-c-results-${Date.now()}.json`);
	fs.writeFileSync(outPath, JSON.stringify({ model: MODEL, session: session.title, results }, null, 2));
	console.log(`\nFull output: ${outPath}`);

	console.log(`
INTERPRETING THIS
  Precision matters more than recall. A spurious link is worse than a missed
  one, because rejecting noise costs you attention while a missed link is just
  the manual work you already do.

  Rough read:
    precision >80%, spurious <10%  ->  worth building the full pipeline
    precision 60-80%               ->  tune relationship-vocabulary.mjs and retry
    precision <60% on 8b           ->  try:  --model granite4.1:30b
    still <60% on 30b              ->  local models can't do this task; stop here

  Note: "you did not make" is not always "wrong". Check the SPURIOUS list by
  hand — some may be relationships you simply missed.
`);
}

main().catch((e) => {
	console.error('\n[X]', e.message, '\n');
	process.exit(1);
});
