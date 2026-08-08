/**
 * PASS C TEST v2 — split gate + constrained type selection.
 *
 * v1 result: precision 11%, recall 92%, type-accuracy 2/12, and it said NONE
 * zero times out of 7 opportunities. Diagnosis:
 *   - detection works (92%) — the model reads the text correctly
 *   - a single 21-way enum including NONE is too much for an 8B
 *   - NONE-as-21st-enum-value is not a real gate
 *
 * v2 changes:
 *   1. TWO calls per pair. Gate first ("is there a persistent tie? yes/no"),
 *      then type — only if the gate passes. Binary decisions are what small
 *      models are good at.
 *   2. Types constrained by entity-type pair (see pair-rules.mjs). npc<->location
 *      offers 4 options, not 21. location<->location offers exactly 1.
 *      Impossible pairs skip the model entirely.
 *   3. Prompt shrunk from ~1400 tokens of vocabulary to ~150. v1 likely
 *      overflowed Ollama's default 4096 context on every call, which is the
 *      probable cause of the 30s/pair timing.
 *   4. num_ctx set explicitly; keep_alive pins the model; GPU placement checked
 *      up front so a CPU fallback is visible rather than silent.
 *
 * Usage:
 *   node test-pass-c-v2.mjs --session <uuid> [--model granite4.1:8b] [--limit 20] [--verbose]
 *   node test-pass-c-v2.mjs --list
 */

import fs from 'fs';
import path from 'path';
import { allowedTypes, SHORT_DEFS } from './pair-rules.mjs';

// ---------------------------------------------------------------- config

const args = process.argv.slice(2);
const getArg = (n, d = null) => {
	const i = args.indexOf(`--${n}`);
	return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const hasFlag = (n) => args.includes(`--${n}`);

const MODEL = getArg('model', 'granite4.1:8b');
const OLLAMA = getArg('ollama', 'http://localhost:11434');
const SESSION_ID = getArg('session');
const LIMIT = parseInt(getArg('limit', '0'), 10);
const VERBOSE = hasFlag('verbose');
const NUM_CTX = parseInt(getArg('ctx', '4096'), 10);

function loadEnv() {
	const p = path.resolve(import.meta.dirname, '../.env');
	if (!fs.existsSync(p)) {
		console.error(`\n[X] No .env at ${p}\n`);
		process.exit(1);
	}
	const out = {};
	for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
	}
	return out;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error('\n[X] .env missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY\n');
	process.exit(1);
}

const sb = async (endpoint) => {
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
		headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
	});
	if (!res.ok) throw new Error(`Supabase ${res.status} on ${endpoint}`);
	return res.json();
};

// ---------------------------------------------------------------- preflight

async function preflight() {
	let tags;
	try {
		const r = await fetch(`${OLLAMA}/api/tags`);
		tags = await r.json();
	} catch {
		console.error(`\n[X] Cannot reach Ollama at ${OLLAMA}. Try: ollama serve\n`);
		process.exit(1);
	}
	const names = (tags.models || []).map((m) => m.name);
	if (!names.some((n) => n === MODEL || n.startsWith(MODEL.split(':')[0]))) {
		console.error(`\n[X] Model "${MODEL}" not installed. Have: ${names.join(', ')}`);
		console.error(`    ollama pull ${MODEL}\n`);
		process.exit(1);
	}

	// Warm the model, then report GPU vs CPU. A CPU fallback is the difference
	// between 1s and 30s per call, so make it loud.
	process.stdout.write('[..] warming model');
	const t = Date.now();
	await fetch(`${OLLAMA}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			stream: false,
			keep_alive: '30m',
			options: { num_ctx: NUM_CTX, temperature: 0 },
			messages: [{ role: 'user', content: 'ok' }],
		}),
	});
	console.log(`\r[ok] model warm (${((Date.now() - t) / 1000).toFixed(1)}s)      `);

	try {
		const ps = await (await fetch(`${OLLAMA}/api/ps`)).json();
		for (const m of ps.models || []) {
			const total = m.size ?? 0;
			const gpu = m.size_vram ?? 0;
			const pctGpu = total ? Math.round((gpu / total) * 100) : 0;
			console.log(`[..] ${m.name}: ${pctGpu}% GPU / ${100 - pctGpu}% CPU, ctx=${NUM_CTX}`);
			if (pctGpu < 90) {
				console.log('     ^ WARNING: not fully on GPU. This is why it is slow.');
				console.log('       Try a smaller model or lower --ctx.');
			}
		}
	} catch {
		/* /api/ps unavailable on older versions — non-fatal */
	}
}

// ---------------------------------------------------------------- data (same as v1)

async function listSessions() {
	const rows = await sb('sessions?select=id,title,attributes&limit=200');
	rows
		.map((r) => ({ id: r.id, title: r.title, num: Number(r.attributes?.session_number ?? 0) }))
		.sort((a, b) => b.num - a.num)
		.forEach((s) => console.log(`  ${String(s.num).padStart(3)}  ${s.id}  ${s.title}`));
}

async function loadSession(id) {
	const rows = await sb(`sessions?id=eq.${id}&select=id,title,narrative,attributes`);
	if (!rows.length) throw new Error(`No session ${id}`);
	return rows[0];
}

async function loadSessionCast(sessionId) {
	const rels = await sb(
		`entity_relationships?from_entity_id=eq.${sessionId}&select=to_entity_id,target:entities!to_entity_id(id,name,type)`
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
	if (cast.length) {
		try {
			const idx = await sb(`view_entity_index?id=in.(${cast.map((c) => c.id).join(',')})&select=id,aliases`);
			const byId = new Map(idx.map((r) => [r.id, r.aliases]));
			for (const c of cast) {
				const raw = byId.get(c.id);
				const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').map((s) => s.trim()) : [];
				c.terms = [c.name, ...list.filter(Boolean)].sort((a, b) => b.length - a.length);
			}
		} catch {
			for (const c of cast) c.terms = [c.name];
		}
	}
	return cast;
}

async function loadGroundTruth(cast) {
	const ids = cast.map((c) => c.id);
	if (!ids.length) return [];
	const rels = await sb(
		`entity_relationships?from_entity_id=in.(${ids.join(',')})&select=from_entity_id,to_entity_id,relationship_type`
	);
	const castIds = new Set(ids);
	return rels.filter((r) => castIds.has(r.to_entity_id));
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildCandidatePairs(narrative, cast, windowSize = 2) {
	const paragraphs = narrative.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
	const pairs = new Map();
	const mentions = (text, e) =>
		(e.terms || [e.name]).some((t) => new RegExp(`\\b${escapeRegex(t)}\\b`, 'i').test(text));

	for (let s = 0; s < paragraphs.length; s++) {
		const text = paragraphs.slice(s, s + windowSize).join('\n\n');
		const present = cast.filter((e) => mentions(text, e));
		for (let i = 0; i < present.length; i++) {
			for (let j = i + 1; j < present.length; j++) {
				const [a, b] = [present[i], present[j]];
				const k = [a.id, b.id].sort().join('|');
				if (!pairs.has(k)) pairs.set(k, { a, b, contexts: [] });
				const ctx = pairs.get(k).contexts;
				if (!ctx.includes(text)) ctx.push(text);
			}
		}
	}
	return [...pairs.values()];
}

// ---------------------------------------------------------------- model calls

async function ollamaChat(prompt, schema) {
	const res = await fetch(`${OLLAMA}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			stream: false,
			format: schema,
			keep_alive: '30m',
			options: { num_ctx: NUM_CTX, temperature: 0, num_predict: 200 },
			messages: [{ role: 'user', content: prompt }],
		}),
	});
	if (!res.ok) throw new Error(`Ollama ${res.status}`);
	const body = await res.json();
	try {
		return JSON.parse(body.message.content);
	} catch {
		return null;
	}
}

const GATE_SCHEMA = {
	type: 'object',
	properties: {
		has_relationship: { type: 'boolean' },
		quote: { type: 'string' },
	},
	required: ['has_relationship', 'quote'],
};

/**
 * CALL 1 — binary gate. Deliberately framed so "no" is the easy answer, since
 * v1 never said NONE at all.
 */
function gatePrompt(pair, text) {
	return `Two things are mentioned in this D&D session text:
  A = ${pair.a.name} (${pair.a.type})
  B = ${pair.b.name} (${pair.b.type})

TEXT:
${text}

QUESTION: Does the text EXPLICITLY STATE a lasting connection between A and B?

Answer false if:
- they are merely mentioned near each other
- one just happens to be present where the other is
- the connection is implied but not stated
- you cannot quote exact words proving it

Answer true ONLY if you can quote words that state the connection.

Set "quote" to the exact words from the text that prove it, or "" if false.
Most pairs are false. Be strict.`;
}

/** CALL 2 — type selection from a restricted set. Only runs if the gate passed. */
function typePrompt(pair, text, types, quote) {
	const defs = types.map((t) => `- ${t}: ${SHORT_DEFS[t] || t}`).join('\n');
	return `A = ${pair.a.name} (${pair.a.type})
B = ${pair.b.name} (${pair.b.type})

EVIDENCE: "${quote}"

CONTEXT:
${text}

Choose the relationship type:
${defs}

Also set direction: A_to_B means (A)-[type]->(B). For parent_location, the CONTAINED place is A.
Prefer the weakest type that fits the evidence.`;
}

async function classifyPair(pair) {
	const types = allowedTypes(pair.a.type, pair.b.type);

	// Structurally impossible combination — no model call needed.
	if (types.length === 0) {
		return { type: 'NONE', reason: 'no valid type for this entity pair', skipped: true };
	}

	const text = pair.contexts.slice(0, 2).join('\n\n');

	const gate = await ollamaChat(gatePrompt(pair, text), GATE_SCHEMA);
	if (!gate) return { type: 'PARSE_ERROR', reason: '' };
	if (!gate.has_relationship) return { type: 'NONE', reason: gate.quote || '' };

	// Single valid type — the gate decided it, no second call required.
	if (types.length === 1) {
		return { type: types[0], reason: gate.quote, direction: 'A_to_B', forced: true };
	}

	const typeSchema = {
		type: 'object',
		properties: {
			relationship_type: { type: 'string', enum: types },
			direction: { type: 'string', enum: ['A_to_B', 'B_to_A'] },
		},
		required: ['relationship_type', 'direction'],
	};

	const pick = await ollamaChat(typePrompt(pair, text, types, gate.quote), typeSchema);
	if (!pick) return { type: 'PARSE_ERROR', reason: gate.quote };
	return { type: pick.relationship_type, direction: pick.direction, reason: gate.quote };
}

// ---------------------------------------------------------------- main

async function main() {
	if (hasFlag('list')) return listSessions();
	if (!SESSION_ID) {
		console.error('\nUsage: node test-pass-c-v2.mjs --session <uuid>\n');
		process.exit(1);
	}

	await preflight();

	const session = await loadSession(SESSION_ID);
	const cast = await loadSessionCast(SESSION_ID);
	const truth = await loadGroundTruth(cast);

	console.log(`\nSession: ${session.title}`);
	console.log(`Cast: ${cast.length} entities | existing relationships: ${truth.length}`);

	let pairs = buildCandidatePairs(session.narrative || '', cast);
	const skippable = pairs.filter((p) => allowedTypes(p.a.type, p.b.type).length === 0).length;
	console.log(`Candidate pairs: ${pairs.length}  (${skippable} skipped by type rules, no model call)`);
	if (LIMIT > 0) pairs = pairs.slice(0, LIMIT);

	const truthMap = new Map();
	for (const r of truth) truthMap.set([r.from_entity_id, r.to_entity_id].sort().join('|'), r.relationship_type);

	console.log(`\nClassifying (${MODEL}, 2-call gate+type)...\n`);
	const t0 = Date.now();
	const results = [];

	for (let i = 0; i < pairs.length; i++) {
		const pair = pairs[i];
		const out = await classifyPair(pair);
		const expected = truthMap.get([pair.a.id, pair.b.id].sort().join('|')) ?? 'NONE';
		results.push({ pair, out, expected, got: out.type, exact: out.type === expected });
		process.stdout.write(`\r  ${i + 1}/${pairs.length}   `);
		if (VERBOSE) {
			console.log(
				`\n  [${out.type === expected ? 'MATCH' : 'DIFF '}] ${pair.a.name} <-> ${pair.b.name}` +
					`\n        expected ${expected} | got ${out.type}${out.skipped ? ' (rule-skipped)' : ''}` +
					`\n        "${out.reason}"`
			);
		}
	}

	const secs = (Date.now() - t0) / 1000;
	console.log(`\n\n${secs.toFixed(1)}s total, ${(secs / pairs.length).toFixed(1)}s/pair\n`);

	const tp = results.filter((r) => r.expected !== 'NONE' && r.got !== 'NONE');
	const exact = tp.filter((r) => r.exact);
	const wrongType = tp.filter((r) => !r.exact);
	const missed = results.filter((r) => r.expected !== 'NONE' && r.got === 'NONE');
	const spurious = results.filter((r) => r.expected === 'NONE' && r.got !== 'NONE');
	const okNone = results.filter((r) => r.expected === 'NONE' && r.got === 'NONE');
	const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : 'n/a');

	console.log('='.repeat(60));
	console.log(`  Correctly NONE       ${okNone.length}`);
	console.log(`  Found + right type   ${exact.length}`);
	console.log(`  Found + wrong type   ${wrongType.length}`);
	console.log(`  Missed               ${missed.length}`);
	console.log(`  Spurious             ${spurious.length}`);
	console.log('-'.repeat(60));
	console.log(`  Precision            ${pct(exact.length, exact.length + wrongType.length + spurious.length)}`);
	console.log(`  Recall               ${pct(tp.length, tp.length + missed.length)}`);
	console.log(`  Type accuracy        ${pct(exact.length, tp.length)}   <- v1 was 17%`);
	console.log(`  Gate accuracy        ${pct(okNone.length, okNone.length + spurious.length)}   <- v1 was 0%`);
	console.log('='.repeat(60));

	if (wrongType.length) {
		console.log('\nWRONG TYPE:');
		for (const r of wrongType.slice(0, 15))
			console.log(
				`  ${r.pair.a.name} <-> ${r.pair.b.name}\n    you: ${r.expected} | model: ${r.got}\n    "${r.out.reason}"`
			);
	}
	if (spurious.length) {
		console.log('\nSPURIOUS:');
		for (const r of spurious.slice(0, 15))
			console.log(`  ${r.pair.a.name} <-> ${r.pair.b.name} -> ${r.got}\n    "${r.out.reason}"`);
	}
	if (missed.length) {
		console.log('\nMISSED:');
		for (const r of missed.slice(0, 15)) console.log(`  ${r.pair.a.name} <-> ${r.pair.b.name} (you: ${r.expected})`);
	}

	const out = path.resolve(import.meta.dirname, `pass-c-v2-${Date.now()}.json`);
	fs.writeFileSync(out, JSON.stringify({ model: MODEL, session: session.title, results }, null, 2));
	console.log(`\nSaved: ${out}\n`);
}

main().catch((e) => {
	console.error('\n[X]', e.message, '\n');
	process.exit(1);
});
