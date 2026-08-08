/**
 * PASS C TEST v3
 *
 * History:
 *   v1 — one call, 21-type enum incl. NONE, full vocabulary in prompt.
 *        Said YES to all 20. detection 92%, type 17%, gate 0/7.
 *   v2 — split binary gate + type call, terse prompt, no type framing in gate.
 *        Said NO to all 20. 13 missed, 0 proposals.
 *
 * What each attempt taught us:
 *   - v1's 92% detection came FROM having the type list in the prompt. Naming the
 *     kinds of relationship on offer is what lets the model recognise one.
 *     v2 removed that and detection collapsed.
 *   - v1's 17% type accuracy came from choosing among 21. pair-rules.mjs cuts
 *     that to 2-5, which is the fix — not splitting the call.
 *   - v2's gate emitted its boolean BEFORE its evidence field. Under constrained
 *     decoding, field order IS reasoning order: it decided, then rationalised.
 *
 * v3 therefore:
 *   1. ONE call again (restores type framing, halves the calls)
 *   2. enum restricted per entity-pair via pair-rules.mjs, plus NONE
 *   3. evidence fields FIRST in the schema, decision LAST
 *   4. balanced prompt — worked examples of both a real link and a non-link
 *   5. metrics that a degenerate always-NONE / always-YES model cannot game
 *
 * Usage:
 *   node test-pass-c-v3.mjs --session <uuid> [--model granite4.1:8b] [--limit 20] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { allowedTypes, SHORT_DEFS } from './pair-rules.mjs';

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
		tags = await (await fetch(`${OLLAMA}/api/tags`)).json();
	} catch {
		console.error(`\n[X] Cannot reach Ollama at ${OLLAMA}\n`);
		process.exit(1);
	}
	const names = (tags.models || []).map((m) => m.name);
	if (!names.some((n) => n === MODEL || n.startsWith(MODEL.split(':')[0]))) {
		console.error(`\n[X] "${MODEL}" not installed. Have: ${names.join(', ')}\n`);
		process.exit(1);
	}
	process.stdout.write('[..] warming');
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
	console.log(`\r[ok] warm (${((Date.now() - t) / 1000).toFixed(1)}s)     `);
	try {
		const ps = await (await fetch(`${OLLAMA}/api/ps`)).json();
		for (const m of ps.models || []) {
			const pct = m.size ? Math.round(((m.size_vram ?? 0) / m.size) * 100) : 0;
			console.log(`[..] ${m.name}: ${pct}% GPU, ctx=${NUM_CTX}`);
			if (pct < 90) console.log('     ^ NOT fully on GPU — try --ctx 2048');
		}
	} catch {}
}

// ---------------------------------------------------------------- data

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

// ---------------------------------------------------------------- the call

/**
 * Schema field order is deliberate and load-bearing.
 *
 * Constrained decoding emits properties in order, so the model must produce
 * `evidence` and `reasoning` BEFORE `relationship_type`. That forces it to look
 * for support in the text before committing to an answer. v2 put the decision
 * first and the model simply answered, then rationalised.
 */
function buildSchema(types) {
	return {
		type: 'object',
		properties: {
			evidence: {
				type: 'string',
				description: 'Words from the text that describe how A and B relate. Empty if none.',
			},
			reasoning: {
				type: 'string',
				description: 'One short sentence: what does the evidence establish?',
			},
			relationship_type: { type: 'string', enum: [...types, 'NONE'] },
			direction: { type: 'string', enum: ['A_to_B', 'B_to_A'] },
		},
		required: ['evidence', 'reasoning', 'relationship_type', 'direction'],
	};
}

function buildPrompt(pair, text, types) {
	const defs = types.map((t) => `  ${t} — ${SHORT_DEFS[t] || t}`).join('\n');
	return `Cataloguing a D&D campaign. Decide how (if at all) these two relate.

A = ${pair.a.name} (${pair.a.type})
B = ${pair.b.name} (${pair.b.type})

TEXT:
${text}

POSSIBLE TYPES (only these apply to a ${pair.a.type}/${pair.b.type} pair):
${defs}
  NONE — the text shows no relationship between them

HOW TO DECIDE
1. First find any words describing how A and B relate. Put them in "evidence".
2. If the text only mentions them near each other with nothing linking them,
   set evidence to "" and answer NONE.
3. Otherwise pick the type the evidence supports. Prefer the weaker option when
   two could fit.
4. direction: A_to_B means (A)-[type]->(B).

EXAMPLE — real relationship:
  A=Captain Soranna (npc)  B=Drellin's Ferry (location)
  Text: "Soranna has commanded the Ferry's garrison for twelve years."
  evidence: "has commanded the Ferry's garrison for twelve years"
  reasoning: "A long-held post in B, so a working relationship."
  relationship_type: workplace_relation, direction: A_to_B

EXAMPLE — no relationship:
  A=Kaedin (character)  B=Vraath Keep (location)
  Text: "Kaedin asked what lay in Vraath Keep. Soranna warned him off."
  evidence: ""
  reasoning: "B is only discussed; A has no stated tie to it."
  relationship_type: NONE, direction: A_to_B

Both answers are common. Judge on the evidence.`;
}

async function classifyPair(pair) {
	const types = allowedTypes(pair.a.type, pair.b.type);
	if (types.length === 0)
		return { type: 'NONE', evidence: '', reasoning: 'no valid type for this pair', skipped: true };

	const text = pair.contexts.slice(0, 2).join('\n\n');
	const res = await fetch(`${OLLAMA}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			stream: false,
			format: buildSchema(types),
			keep_alive: '30m',
			options: { num_ctx: NUM_CTX, temperature: 0, num_predict: 300 },
			messages: [{ role: 'user', content: buildPrompt(pair, text, types) }],
		}),
	});
	if (!res.ok) throw new Error(`Ollama ${res.status}`);
	let out;
	try {
		out = JSON.parse((await res.json()).message.content);
	} catch {
		return { type: 'PARSE_ERROR', evidence: '', reasoning: '' };
	}
	return {
		type: out.relationship_type,
		direction: out.direction,
		evidence: out.evidence || '',
		reasoning: out.reasoning || '',
		offered: types.length,
	};
}

// ---------------------------------------------------------------- main

async function main() {
	if (hasFlag('list')) return listSessions();
	if (!SESSION_ID) {
		console.error('\nUsage: node test-pass-c-v3.mjs --session <uuid>\n');
		process.exit(1);
	}
	await preflight();

	const session = await loadSession(SESSION_ID);
	const cast = await loadSessionCast(SESSION_ID);
	const truth = await loadGroundTruth(cast);
	console.log(`\nSession: ${session.title}`);
	console.log(`Cast: ${cast.length} | existing relationships: ${truth.length}`);

	let pairs = buildCandidatePairs(session.narrative || '', cast);
	console.log(`Candidate pairs: ${pairs.length}`);
	if (LIMIT > 0) pairs = pairs.slice(0, LIMIT);

	const truthMap = new Map();
	for (const r of truth) truthMap.set([r.from_entity_id, r.to_entity_id].sort().join('|'), r.relationship_type);

	console.log(`\nClassifying (${MODEL}, evidence-first, restricted enum)...\n`);
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
				`\n  [${out.type === expected ? 'MATCH' : 'DIFF '}] ${pair.a.name} <-> ${pair.b.name}  (${out.offered ?? 0} options)` +
					`\n        expected ${expected} | got ${out.type}` +
					`\n        evidence : "${out.evidence}"` +
					`\n        reasoning: ${out.reasoning}`
			);
		}
	}
	const secs = (Date.now() - t0) / 1000;
	console.log(`\n\n${secs.toFixed(1)}s total, ${(secs / pairs.length).toFixed(1)}s/pair\n`);

	// ---------------- metrics that cannot be gamed by a degenerate answer ----
	const realPairs = results.filter((r) => r.expected !== 'NONE');
	const nonePairs = results.filter((r) => r.expected === 'NONE');
	const detected = realPairs.filter((r) => r.got !== 'NONE');
	const exact = realPairs.filter((r) => r.exact);
	const wrongType = detected.filter((r) => !r.exact);
	const missed = realPairs.filter((r) => r.got === 'NONE');
	const spurious = nonePairs.filter((r) => r.got !== 'NONE');
	const okNone = nonePairs.filter((r) => r.got === 'NONE');
	const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : 'n/a');

	const tpr = realPairs.length ? detected.length / realPairs.length : 0; // sensitivity
	const tnr = nonePairs.length ? okNone.length / nonePairs.length : 0; // specificity
	const balanced = Math.round(((tpr + tnr) / 2) * 100);

	console.log('='.repeat(62));
	console.log(`  pairs ${results.length}   (real ${realPairs.length} / none ${nonePairs.length})`);
	console.log('-'.repeat(62));
	console.log(`  right type           ${exact.length}`);
	console.log(`  wrong type           ${wrongType.length}`);
	console.log(`  missed               ${missed.length}`);
	console.log(`  spurious             ${spurious.length}`);
	console.log(`  correctly NONE       ${okNone.length}`);
	console.log('-'.repeat(62));
	console.log(`  DETECTION (TPR)      ${pct(detected.length, realPairs.length)}   found a link where one exists`);
	console.log(`  REJECTION (TNR)      ${pct(okNone.length, nonePairs.length)}   said NONE where none exists`);
	console.log(`  BALANCED ACCURACY    ${balanced}%   <-- the headline number`);
	console.log(`  TYPE (given found)   ${pct(exact.length, detected.length)}`);
	console.log('='.repeat(62));
	console.log(`
  Balanced accuracy is (TPR+TNR)/2, so a model that always answers NONE scores
  50%, not 100%. v1 always said yes: TPR 92 / TNR 0 -> 46%. v2 always said no:
  TPR 0 / TNR 100 -> 50%. Both are coin flips wearing different hats.

  Useful means balanced >75% AND type >70%.
`);

	if (missed.length) {
		console.log('MISSED (had a real relationship, model said NONE):');
		for (const r of missed.slice(0, 12))
			console.log(
				`  ${r.pair.a.name} <-> ${r.pair.b.name}  you: ${r.expected}\n      evidence found: "${r.out.evidence}"`
			);
	}
	if (wrongType.length) {
		console.log('\nWRONG TYPE:');
		for (const r of wrongType.slice(0, 12))
			console.log(
				`  ${r.pair.a.name} <-> ${r.pair.b.name}\n      you: ${r.expected} | model: ${r.got}\n      "${r.out.evidence}"`
			);
	}
	if (spurious.length) {
		console.log('\nSPURIOUS:');
		for (const r of spurious.slice(0, 12))
			console.log(`  ${r.pair.a.name} <-> ${r.pair.b.name} -> ${r.got}\n      "${r.out.evidence}"`);
	}

	const outPath = path.resolve(import.meta.dirname, `pass-c-v3-${Date.now()}.json`);
	fs.writeFileSync(outPath, JSON.stringify({ model: MODEL, session: session.title, results }, null, 2));
	console.log(`\nSaved: ${outPath}\n`);
}

main().catch((e) => {
	console.error('\n[X]', e.message, '\n');
	process.exit(1);
});
