/**
 * FULL PIPELINE TEST — discovery, descriptions, relationships, timeline events.
 *
 * Runs every pass and emits an import payload. WRITES NOTHING to your database.
 *
 *   Pass A  discover entities in the narrative        (model)
 *   Pass B1 match against existing entities           (deterministic)
 *   Pass B2 write description + attributes for NEW    (model)
 *   Pass B3 propose description updates for EXISTING  (model)
 *   Pass C  relationships between entities            (model, from test-pass-c-v3)
 *   Pass D  timeline events                           (model)
 *
 * Output: import-payload-<ts>.json — ref-based, so relationships can point at
 * entities that don't exist yet. The importer resolves refs in two passes.
 *
 * Usage:
 *   node test-pipeline.mjs --narrative path/to/narrative.txt [--campaign <uuid>]
 *   node test-pipeline.mjs --session <uuid>        # reuse an existing session's text
 *   node test-pipeline.mjs --session <uuid> --passes A,B,D
 */

import fs from 'fs';
import path from 'path';
import {
	ENTITY_TYPES,
	TYPE_SPECS,
	EVENT_TYPES,
	discoverySchema,
	describeSchema,
	eventsSchema,
} from './entity-schemas.mjs';
import { allowedTypes, SHORT_DEFS } from './pair-rules.mjs';
import { checkProperNoun } from './proper-noun.mjs';
import { styleBlock } from './style-guide.mjs';
import { checkStyle } from './style-check.mjs';

const args = process.argv.slice(2);
const getArg = (n, d = null) => {
	const i = args.indexOf(`--${n}`);
	return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const hasFlag = (n) => args.includes(`--${n}`);

const MODEL = getArg('model', 'granite4.1:8b');
// Optional second model used ONLY for prose (descriptions, event text). Granite
// still does all structure: discovery, typing, matching, classification, review.
const PROSE_MODEL = getArg('prose-model', null);
const OLLAMA = getArg('ollama', 'http://localhost:11434');
const NUM_CTX = parseInt(getArg('ctx', '8192'), 10); // discovery needs the whole narrative
const SESSION_ID = getArg('session');
const NARRATIVE_FILE = getArg('narrative');
const CAMPAIGN_ID = getArg('campaign');
const PASSES = (getArg('passes', 'A,B,C,D,R') || '').split(',').map((s) => s.trim().toUpperCase());
const VERBOSE = hasFlag('verbose');

// Output token caps per pass. Too low truncates JSON mid-object and you get a
// parse failure; too high inflates the KV cache and can push the model to CPU.
// Raise these if --verbose shows "[parse fail]".
const OUT = {
	discover: parseInt(getArg('out-discover', '2048'), 10), // pass A: many entities
	describe: parseInt(getArg('out-describe', '1200'), 10), // pass B: facts array + description + attributes
	pair: parseInt(getArg('out-pair', '300'), 10), // pass C: one classification
	events: parseInt(getArg('out-events', '2048'), 10), // pass D: many events
};

function loadEnv() {
	const p = path.resolve(import.meta.dirname, '../.env');
	if (!fs.existsSync(p)) return {};
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
	if (!SUPABASE_URL) throw new Error('No VITE_SUPABASE_URL in ../.env');
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
		headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
	});
	if (!res.ok) throw new Error(`Supabase ${res.status} on ${endpoint}`);
	return res.json();
};

/**
 * Per-pass context sizes.
 *
 * Passes A, B2, B3 and D all embed the WHOLE narrative, so they need the full
 * context. Only pass C works on a 2-paragraph excerpt, so it can run in a small
 * window — which matters because pass C is by far the most calls, and a smaller
 * KV cache is what keeps the model fully GPU-resident.
 */
const CTX = {
	full: NUM_CTX, // A, B2, B3, D — whole narrative
	pair: Math.min(NUM_CTX, 4096), // C — two paragraphs only
};

/**
 * @param {string} prompt
 * @param {object} schema      JSON schema for constrained output
 * @param {number} ctx         context window for this call
 * @param {number} maxOut      num_predict — cap output so a runaway generation
 *                             cannot eat the whole context
 */
async function ask(prompt, schema, ctx = NUM_CTX, maxOut = 2048, model = MODEL) {
	const res = await fetch(`${OLLAMA}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model,
			stream: false,
			format: schema,
			keep_alive: '30m',
			options: { num_ctx: ctx, temperature: 0, num_predict: maxOut },
			messages: [{ role: 'user', content: prompt }],
		}),
	});
	if (!res.ok) throw new Error(`Ollama ${res.status} — ${await res.text().catch(() => '')}`);
	const body = await res.json();
	const content = body?.message?.content;

	if (typeof content !== 'string') {
		console.log(`\n  [no content] response keys: ${Object.keys(body || {}).join(', ')}`);
		if (body?.error) console.log(`  [ollama error] ${body.error}`);
		return null;
	}

	try {
		return JSON.parse(content);
	} catch (err) {
		// Print enough to actually diagnose: why it stopped, how long the output
		// was, and both ends of the raw text. A truncated JSON looks fine at the
		// start and simply stops; a refusal or prose reply looks wrong at char 0.
		console.log(`\n  [parse fail] ${err.message}`);
		console.log(`    model        ${model}`);
		console.log(
			`    done_reason  ${body.done_reason ?? '(none)'}   eval_count ${body.eval_count ?? '?'} / cap ${maxOut}`
		);
		console.log(`    length       ${content.length} chars`);
		console.log(`    starts       ${JSON.stringify(content.slice(0, 160))}`);
		if (content.length > 160) console.log(`    ends         ${JSON.stringify(content.slice(-80))}`);
		if (body.done_reason === 'length' || body.eval_count >= maxOut) {
			console.log(`    >> TRUNCATED. Raise the output cap for this pass.`);
		}
		return null;
	}
}

/** Verify Ollama is up, both models are present, and report GPU placement. */
async function preflight() {
	let tags;
	try {
		tags = await (await fetch(`${OLLAMA}/api/tags`)).json();
	} catch {
		console.error(`\n[X] Cannot reach Ollama at ${OLLAMA}. Try: ollama serve\n`);
		process.exit(1);
	}
	const installed = (tags.models || []).map((m) => m.name);
	const have = (m) => installed.some((n) => n === m || n.startsWith(m.split(':')[0]));

	for (const m of [MODEL, PROSE_MODEL].filter(Boolean)) {
		if (!have(m)) {
			console.error(`\n[X] Model "${m}" not installed.`);
			console.error(`    ollama pull ${m}\n`);
			process.exit(1);
		}
	}

	console.log(`Structure model: ${MODEL}`);
	console.log(`Prose model    : ${PROSE_MODEL || '(same as structure)'}`);
	if (PROSE_MODEL) {
		console.log('  [!] Two models will alternate. Ollama may evict one between calls if VRAM is');
		console.log('      tight, adding a reload each switch. Passes are grouped to minimise this.');
	}
}

// ============================================================ normalisation

/** Aggressive normalisation for name matching: strip titles, punctuation, case. */
const TITLES =
	/^(captain|cap\.|lord|lady|sir|dame|king|queen|prince|princess|duke|baron|master|mistress|father|mother|brother|sister|elder|chief|general|sergeant|commander|the)\s+/i;

function normName(s) {
	let n = (s || '').toLowerCase().trim();
	let prev;
	do {
		prev = n;
		n = n.replace(TITLES, '');
	} while (n !== prev);
	return n
		.replace(/[^\w\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Shared by excerpting and pair generation. Declared here: const is not hoisted. */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ============================================================ PASS A

function discoveryPrompt(narrative, excludeNames = []) {
	const typeList = ENTITY_TYPES.map((t) => `  ${t} — ${TYPE_SPECS[t].hint}`).join('\n');
	const exclude = excludeNames.length
		? `\nALREADY IN THE CAMPAIGN — DO NOT LIST THESE:\n  ${excludeNames.join(', ')}\n`
		: '';
	return `List every named entity in this D&D session narrative.

For each one:
  proper_noun = its NAME, exactly as written (e.g. "Captain Soranna", "Vraath Keep")
  category    = which kind of thing it is, from this list:
${typeList}

CRITICAL: proper_noun is the NAME. category is the KIND. Never put a category
word like "npc" or "location" into proper_noun.

  correct:  proper_noun "Captain Soranna"   category npc
  correct:  proper_noun "Drellin's Ferry"   category location
  WRONG:    proper_noun "npc"               category npc
${exclude}
RULES
- Proper nouns only. "a guard" is not an entity; "Captain Soranna" is.
- Every entry needs "quote" — exact words from the text where it appears.
- Do not invent. If you cannot quote it, do not list it.
- "aliases": other names for the SAME entity in this text. Empty array if none.
- One entry per entity, however often it appears.

NARRATIVE:
${narrative}`;
}

async function passA(narrative, excludeNames = []) {
	console.log('\n=== PASS A: discovering entities ===');
	const t = Date.now();
	const out = await ask(discoveryPrompt(narrative, excludeNames), discoverySchema(), CTX.full, OUT.discover);
	if (!out?.entities) {
		console.log('  [X] no valid output');
		return [];
	}

	const excludeSet = new Set(excludeNames.map(normName));
	const kept = [];
	const rejects = { categoryAsName: 0, badCategory: 0, excluded: 0, unverifiable: 0, notProperNoun: 0, dupe: 0 };
	const seen = new Set();

	for (const raw of out.entities) {
		// Accept the new field names, tolerate the old ones.
		const e = {
			name: String(raw.proper_noun ?? raw.name ?? '').trim(),
			type: String(raw.category ?? raw.type ?? '')
				.trim()
				.toLowerCase(),
			quote: String(raw.quote ?? '').trim(),
			aliases: Array.isArray(raw.aliases) ? raw.aliases.filter(Boolean) : [],
		};

		// Run-1 failure mode: the category word ended up in the name field.
		if (!e.name || ENTITY_TYPES.includes(normName(e.name)) || normName(e.name) === 'player character') {
			rejects.categoryAsName++;
			if (VERBOSE) console.log(`  [reject] name is a category word: "${e.name}"`);
			continue;
		}
		// Run 1 also invented a category outside the enum ("player_character").
		if (!ENTITY_TYPES.includes(e.type)) {
			rejects.badCategory++;
			if (VERBOSE) console.log(`  [reject] "${e.name}" — invalid category "${e.type}"`);
			continue;
		}
		// Player characters and anything already catalogued.
		if (excludeSet.has(normName(e.name)) || e.aliases.some((a) => excludeSet.has(normName(a)))) {
			rejects.excluded++;
			if (VERBOSE) console.log(`  [skip]   ${e.name} — player character / already known`);
			continue;
		}
		// Must be verifiable in the source text.
		const nameInText = narrative.toLowerCase().includes(e.name.toLowerCase());
		const quoteInText = e.quote.length > 3 && narrative.toLowerCase().includes(e.quote.toLowerCase().slice(0, 40));
		if (!nameInText && !quoteInText) {
			rejects.unverifiable++;
			if (VERBOSE) console.log(`  [reject] "${e.name}" — not present in narrative`);
			continue;
		}
		// A name that normalises to nothing (e.g. "???") would produce the ref
		// "npc_" and collide with every other such entity.
		if (!normName(e.name)) {
			rejects.categoryAsName++;
			if (VERBOSE) console.log(`  [reject] "${e.name}" — no usable characters in name`);
			continue;
		}
		// Capitalisation check: catches "ancient turtle" / "old woman" — present in
		// the text and validly typed, but a description rather than a name.
		const pn = checkProperNoun(e.name, narrative);
		if (!pn.ok) {
			rejects.notProperNoun = (rejects.notProperNoun || 0) + 1;
			if (VERBOSE) console.log(`  [reject] "${e.name}" — ${pn.reason}`);
			continue;
		}
		// Prefer the source's own casing ("the Witchwood" -> "Witchwood").
		if (pn.suggestion && pn.suggestion !== e.name) {
			if (VERBOSE) console.log(`  [recase] "${e.name}" -> "${pn.suggestion}"`);
			e.name = pn.suggestion;
		}

		const dedupeKey = e.type + '|' + normName(e.name);
		if (seen.has(dedupeKey)) {
			rejects.dupe++;
			continue;
		}
		seen.add(dedupeKey);
		kept.push(e);
	}

	const dropped = Object.values(rejects).reduce((a, b) => a + b, 0);
	console.log(`  kept ${kept.length}, dropped ${dropped}  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
	if (dropped) {
		console.log(
			'    ' +
				Object.entries(rejects)
					.filter(([, v]) => v)
					.map(([k, v]) => `${k}:${v}`)
					.join('  ')
		);
	}
	const byType = {};
	for (const e of kept) byType[e.type] = (byType[e.type] || 0) + 1;
	console.log(
		'  ' +
			(Object.entries(byType)
				.map(([k, v]) => `${k}:${v}`)
				.join('  ') || '(none)')
	);
	if (VERBOSE) for (const e of kept) console.log(`    [${e.type}] ${e.name}`);
	return kept;
}

// ============================================================ PASS B1 (deterministic)

async function loadExistingIndex(campaignId) {
	if (!campaignId) return [];
	try {
		const rows = await sb(`view_entity_index?campaign_id=eq.${campaignId}&select=id,name,type,aliases,description`);
		return rows.map((r) => {
			const raw = r.aliases;
			const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').map((s) => s.trim()) : [];
			return { ...r, terms: [r.name, ...list.filter(Boolean)] };
		});
	} catch (e) {
		console.log(`  [!] could not load existing index: ${e.message}`);
		return [];
	}
}

function matchExisting(discovered, index) {
	console.log('\n=== PASS B1: matching against existing entities (no model) ===');
	const news = [];
	const existing = [];
	for (const d of discovered) {
		const dn = normName(d.name);
		const dAliases = (d.aliases || []).map(normName);
		const hit = index.find((x) => {
			if ((x.type || '').toLowerCase() !== d.type) return false;
			return x.terms.some((t) => {
				const tn = normName(t);
				return tn === dn || dAliases.includes(tn);
			});
		});
		if (hit) existing.push({ ...d, existingId: hit.id, existingDescription: hit.description });
		else news.push(d);
	}
	console.log(`  new: ${news.length}   already exist: ${existing.length}`);
	if (VERBOSE) {
		for (const e of existing) console.log(`    [match] ${e.name} -> ${e.existingId}`);
		for (const n of news) console.log(`    [new]   ${n.name} (${n.type})`);
	}
	return { news, existing };
}

// ============================================================ PASS B2 / B3

/**
 * Excerpt only the paragraphs that actually mention this entity.
 *
 * Run 1 handed the whole narrative to every call and got a whole-session summary
 * back for each entity — including one description that began "Bonnie, a named
 * individual who is not a player character", i.e. the TYPE_SPECS hint text leaking
 * straight into output. Narrowing the input is a stronger fix than instructing.
 */
function excerptFor(entity, narrative, windowSize = 1) {
	const paras = narrative.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
	const terms = [entity.name, ...(entity.aliases || [])].filter(Boolean);
	const hits = new Set();
	paras.forEach((p, i) => {
		if (terms.some((t) => new RegExp(`\\b${escapeRegex(t)}\\b`, 'i').test(p))) {
			for (let d = -windowSize; d <= windowSize; d++) {
				if (i + d >= 0 && i + d < paras.length) hits.add(i + d);
			}
		}
	});
	const picked = [...hits].sort((a, b) => a - b).map((i) => paras[i]);
	return picked.length ? picked.join('\n\n') : narrative;
}

function describePrompt(entity, narrative, isUpdate, currentDescription) {
	const spec = TYPE_SPECS[entity.type];
	const attrLines = Object.entries(spec.attributes || {})
		.map(([k, v]) => `  ${k}: ${v}`)
		.join('\n');
	const excerpt = excerptFor(entity, narrative);

	if (isUpdate) {
		return `Return ONLY a JSON object. No prose outside the JSON.

Update the wiki entry for ${entity.name}.

${styleBlock(entity.type)}

CURRENT ENTRY:
${currentDescription || '(none)'}

PASSAGES FROM THIS SESSION MENTIONING ${entity.name}:
${excerpt}

STEP 1 — "facts_about_entity": list only what these passages state about
${entity.name} specifically. Not what other characters did. Not general session
events. If nothing new, return an empty array.

STEP 2 — "description": if facts_about_entity is empty, return the CURRENT ENTRY
verbatim. Otherwise extend it with the new facts, keeping what is still true.
Write about ${entity.name} only. 2-3 sentences. Do not summarise the session.

STEP 3 — "attributes": fill in only where these passages give evidence. Use
"UNKNOWN" otherwise. Never guess.
${attrLines}`;
	}

	return `Return ONLY a JSON object. No prose outside the JSON.

Write a wiki entry for ${entity.name}.

${styleBlock(entity.type)}

PASSAGES MENTIONING ${entity.name}:
${excerpt}

STEP 1 — "facts_about_entity": list only what these passages state about
${entity.name} specifically. Not events they merely witnessed. Not what other
characters did.

STEP 2 — "description": write about ${entity.name} in the voice shown above,
built only from facts_about_entity.
  - Open with a bare noun phrase, NOT "${entity.name} is…".
  - Write about ${entity.name}, not about the session.
  - Concrete detail over adjectives.
  - If the passages say little, write less. A short entry is better than padding.

STEP 3 — "attributes": fill in only where the passages give evidence. Use
"UNKNOWN" otherwise. Never guess.
${attrLines}`;
}

async function passB2(news, narrative) {
	if (!news.length) return [];
	console.log(`\n=== PASS B2: writing descriptions for ${news.length} new entities ===`);
	const out = [];
	for (let i = 0; i < news.length; i++) {
		const e = news[i];
		process.stdout.write(`\r  ${i + 1}/${news.length}  ${e.name.padEnd(30).slice(0, 30)}`);

		// Generate, style-check, retry once with the violations fed back. Small
		// models drift to "X is a…" and to hedging even when told not to; one
		// corrective pass fixes most of it.
		let r = await ask(
			describePrompt(e, narrative, false),
			describeSchema(e.type, e.name),
			CTX.full,
			OUT.describe,
			PROSE_MODEL || MODEL
		);
		let style = checkStyle(r?.description || '', e.type, e.name);
		if (style.violations.length && r?.description) {
			const fix = `${describePrompt(e, narrative, false)}

A previous attempt produced this, which BREAKS the voice rules:
"${r.description}"

Problems:
${style.violations.map((x) => '  - ' + x).join('\n')}

Rewrite it, fixing every problem. Keep only facts the passages support.`;
			const retry = await ask(fix, describeSchema(e.type, e.name), CTX.full, OUT.describe, PROSE_MODEL || MODEL);
			const retryStyle = checkStyle(retry?.description || '', e.type, e.name);
			// Keep the retry only if it is actually better.
			if (retry?.description && retryStyle.violations.length < style.violations.length) {
				r = retry;
				style = retryStyle;
				if (VERBOSE) console.log(`\n  [retry improved] ${e.name}`);
			} else if (VERBOSE) {
				console.log(`\n  [retry no better, kept original] ${e.name}`);
			}
		}
		if (VERBOSE && style.violations.length) {
			console.log(`\n  [style] ${e.name} (${style.words}w): ${style.violations.join('; ')}`);
		}

		const attrs = {};
		for (const [k, v] of Object.entries(r?.attributes || {})) {
			if (v && v !== 'UNKNOWN' && String(v).trim()) attrs[k] = v;
		}
		out.push({
			ref: `${e.type}_${normName(e.name).replace(/\s+/g, '_')}`,
			type: e.type,
			name: e.name,
			aliases: e.aliases || [],
			description: r?.description || '',
			attributes: attrs,
			_evidence: e.quote,
			_style: { words: style.words, violations: style.violations },
		});
	}
	console.log('\r  done' + ' '.repeat(40));
	return out;
}

async function passB3(existing, narrative) {
	if (!existing.length) return [];
	console.log(`\n=== PASS B3: proposing updates for ${existing.length} existing entities ===`);
	const out = [];
	for (let i = 0; i < existing.length; i++) {
		const e = existing[i];
		process.stdout.write(`\r  ${i + 1}/${existing.length}  ${e.name.padEnd(30).slice(0, 30)}`);
		const r = await ask(
			describePrompt(e, narrative, true, e.existingDescription),
			describeSchema(e.type, e.name),
			CTX.full,
			OUT.describe,
			PROSE_MODEL || MODEL
		);
		const newDesc = (r?.description || '').trim();
		const oldDesc = (e.existingDescription || '').trim();
		const changed = newDesc && newDesc !== oldDesc;
		const attrs = {};
		for (const [k, v] of Object.entries(r?.attributes || {})) {
			if (v && v !== 'UNKNOWN' && String(v).trim()) attrs[k] = v;
		}
		out.push({
			id: e.existingId,
			ref: `existing_${e.existingId}`,
			type: e.type,
			name: e.name,
			descriptionChanged: changed,
			oldDescription: oldDesc,
			newDescription: newDesc,
			attributes: attrs,
		});
	}
	const changedCount = out.filter((o) => o.descriptionChanged).length;
	console.log(`\r  ${changedCount}/${existing.length} have description changes` + ' '.repeat(20));
	return out;
}

// ============================================================ PASS C

function buildPairs(narrative, cast, windowSize = 2) {
	const paras = narrative.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
	const pairs = new Map();
	const mentions = (text, e) =>
		[e.name, ...(e.aliases || [])].some((t) => t && new RegExp(`\\b${escapeRegex(t)}\\b`, 'i').test(text));
	for (let s = 0; s < paras.length; s++) {
		const text = paras.slice(s, s + windowSize).join('\n\n');
		const present = cast.filter((e) => mentions(text, e));
		for (let i = 0; i < present.length; i++)
			for (let j = i + 1; j < present.length; j++) {
				const [a, b] = [present[i], present[j]];
				const k = [a.ref, b.ref].sort().join('|');
				if (!pairs.has(k)) pairs.set(k, { a, b, contexts: [] });
				const c = pairs.get(k).contexts;
				if (!c.includes(text)) c.push(text);
			}
	}
	return [...pairs.values()];
}

async function passC(cast, narrative) {
	const pairs = buildPairs(narrative, cast).filter((p) => allowedTypes(p.a.type, p.b.type).length > 0);
	console.log(`\n=== PASS C: classifying ${pairs.length} candidate pairs ===`);
	const out = [];
	for (let i = 0; i < pairs.length; i++) {
		const p = pairs[i];
		const types = allowedTypes(p.a.type, p.b.type);
		const defs = types.map((t) => `  ${t} — ${SHORT_DEFS[t] || t}`).join('\n');
		const text = p.contexts.slice(0, 2).join('\n\n');
		process.stdout.write(`\r  ${i + 1}/${pairs.length}   `);

		const schema = {
			type: 'object',
			properties: {
				evidence: { type: 'string' },
				reasoning: { type: 'string' },
				relationship_type: { type: 'string', enum: [...types, 'NONE'] },
				direction: { type: 'string', enum: ['A_to_B', 'B_to_A'] },
			},
			required: ['evidence', 'reasoning', 'relationship_type', 'direction'],
		};

		const prompt = `A = ${p.a.name} (${p.a.type})
B = ${p.b.name} (${p.b.type})

TEXT:
${text}

POSSIBLE TYPES:
${defs}
  NONE — text shows no relationship

1. Find words describing how A and B relate -> "evidence".
2. If they are only mentioned near each other, evidence "" and answer NONE.
3. Otherwise pick the type the evidence supports. Prefer the weaker option.
4. direction: A_to_B means (A)-[type]->(B).

Both answers are common. Judge on the evidence.`;

		const r = await ask(prompt, schema, CTX.pair, OUT.pair);
		if (r && r.relationship_type && r.relationship_type !== 'NONE') {
			const [from, to] = r.direction === 'B_to_A' ? [p.b, p.a] : [p.a, p.b];
			out.push({
				from: from.ref,
				to: to.ref,
				type: r.relationship_type,
				because: r.evidence,
				_names: `${from.name} -> ${to.name}`,
			});
		}
	}
	console.log(`\r  proposed ${out.length} relationships` + ' '.repeat(20));
	return out;
}

// ============================================================ PASS D

/**
 * PASS D — timeline events.
 *
 * Runs BEFORE pass C, because events are first-class entities in the schema:
 * a session_events row gets entity_relationships with from_entity_id = <event id>
 * and relationship_type 'mention' (see NarrativeSuggestionPanel's apply step).
 *
 * So each event gets its own ref, and its entity mentions become relationships
 * in the same list pass C contributes to. Pass C then also sees events as
 * candidate participants where that makes sense.
 */
async function passD(narrative, cast) {
	console.log('\n=== PASS D: timeline events (before C — events are linkable) ===');
	const names = cast.map((c) => c.name).join(', ');
	const prompt = `Break this D&D session into a chronological list of timeline events — the beats a player would want in a recap.

EVENT TYPES: ${EVENT_TYPES.join(', ')}

RULES
- In narrative order.
- "title": 3-8 words, concrete. Not "The party travels" but "Crossing the Witchwood".
- "description": 1-3 sentences of what happened.
- "entities_involved": names of entities that APPEAR IN or are DIRECTLY INVOLVED
  in this specific event. Use only these names, or an empty array:
  ${names || '(none)'}
  Do not list an entity merely because it was mentioned in passing.
- 5-15 events for a typical session. Merge trivia; do not invent.

NARRATIVE:
${narrative}`;

	const t = Date.now();
	const r = await ask(prompt, eventsSchema(), CTX.full, OUT.events, PROSE_MODEL || MODEL);
	if (!r?.events) {
		console.log('  [X] no valid output');
		return { events: [], mentions: [] };
	}

	const byName = new Map(cast.map((c) => [normName(c.name), c]));
	const events = [];
	const mentions = [];

	r.events.forEach((e, i) => {
		const ref = `event_${String(i + 1).padStart(2, '0')}`;
		const matched = [];
		const unmatched = [];
		for (const n of e.entities_involved || []) {
			const hit = byName.get(normName(n));
			if (hit) matched.push(hit);
			else unmatched.push(n);
		}

		events.push({
			ref,
			order: i + 1,
			title: e.title,
			description: e.description,
			event_type: e.event_type,
			_unmatched: unmatched,
		});

		// Event -> entity 'mention' links, exactly as the admin Scanner writes them.
		for (const m of matched) {
			mentions.push({
				from: ref,
				to: m.ref,
				type: 'mention',
				because: `appears in event: ${e.title}`,
				_names: `[${e.title}] -> ${m.name}`,
			});
		}
	});

	const totalUnmatched = events.reduce((n, e) => n + (e._unmatched?.length || 0), 0);
	console.log(
		`  ${events.length} events, ${mentions.length} event->entity mentions` +
			(totalUnmatched ? `, ${totalUnmatched} unmatched names` : '') +
			` in ${((Date.now() - t) / 1000).toFixed(1)}s`
	);
	return { events, mentions };
}

// ============================================================ PASS R (review)

/**
 * PASS R — Granite reviews the assembled payload.
 *
 * Runs last, on the STRUCTURE model regardless of --prose-model: this is a
 * judgement task, not a writing one.
 *
 * Each item is reviewed in isolation with a fresh call, because a model asked to
 * "check this list of 40 things" tends to rubber-stamp. One item, one verdict.
 *
 * Deterministic guards already reject what is mechanically checkable. This pass
 * catches what needs reading: a description asserting something the narrative
 * never said, an event mention of an entity that was not actually involved.
 * Nothing is deleted — items are flagged, and you decide.
 */
const REVIEW_SCHEMA = {
	type: 'object',
	properties: {
		problem: {
			type: 'string',
			description: 'The specific problem, or "" if the item is sound.',
		},
		verdict: { type: 'string', enum: ['keep', 'flag'] },
	},
	required: ['problem', 'verdict'],
};

async function passR(payload, narrative) {
	console.log('\n=== PASS R: reviewing payload ===');
	const t = Date.now();
	const flags = [];
	let checked = 0;

	// 1. Entity descriptions — the highest-value check, since a plausible-sounding
	//    invention here silently poisons the wiki.
	for (const e of payload.entities) {
		if (!e.description) continue;
		const excerpt = excerptFor({ name: e.name, aliases: e.aliases }, narrative);
		const r = await ask(
			`Check whether this wiki entry is supported by the source text.

ENTITY: ${e.name} (${e.type})

PROPOSED ENTRY:
${e.description}

SOURCE PASSAGES:
${excerpt}

Flag it ONLY if the entry:
  - states something the passages do not support, or
  - is mostly about other characters or the session in general rather than ${e.name}, or
  - opens by defining what a ${e.type} is instead of describing ${e.name}.

Otherwise keep. Brief prose with little detail is fine — keep it.`,
			REVIEW_SCHEMA,
			CTX.full,
			200
		);
		checked++;
		if (r?.verdict === 'flag') flags.push({ kind: 'description', ref: e.ref, name: e.name, problem: r.problem });
		process.stdout.write(`\r  ${checked} checked   `);
	}

	// 2. Event -> entity mentions. The passerby problem, one level down.
	const evMentions = payload.relationships.filter((r) => r.type === 'mention' && r.from.startsWith('event_'));
	for (const m of evMentions) {
		const ev = payload.events.find((e) => e.ref === m.from);
		if (!ev) continue;
		const entName = m._names?.split('-> ')[1] || m.to;
		const r = await ask(
			`EVENT: ${ev.title}
WHAT HAPPENED: ${ev.description}

Was "${entName}" actually involved in or present at this event?

Flag if "${entName}" was not part of this event — mentioned elsewhere in the
session, or merely referred to in passing, does not count.`,
			REVIEW_SCHEMA,
			CTX.pair,
			200
		);
		checked++;
		if (r?.verdict === 'flag')
			flags.push({
				kind: 'event-mention',
				ref: `${m.from}->${m.to}`,
				name: `[${ev.title}] -> ${entName}`,
				problem: r.problem,
			});
		process.stdout.write(`\r  ${checked} checked   `);
	}

	// 3. Semantic relationships — re-judge against the quoted evidence only.
	const semantic = payload.relationships.filter((r) => r.type !== 'mention');
	for (const rel of semantic) {
		const r = await ask(
			`RELATIONSHIP CLAIM: ${rel._names}  (type: ${rel.type})
EVIDENCE QUOTED: "${rel.because}"

Does that evidence actually establish a "${rel.type}" relationship?

Flag if the evidence is missing, does not support this relationship type, or
only shows the two were mentioned together.`,
			REVIEW_SCHEMA,
			CTX.pair,
			200
		);
		checked++;
		if (r?.verdict === 'flag')
			flags.push({ kind: 'relationship', ref: `${rel.from}->${rel.to}`, name: rel._names, problem: r.problem });
		process.stdout.write(`\r  ${checked} checked   `);
	}

	console.log(`\r  ${checked} items checked, ${flags.length} flagged  (${((Date.now() - t) / 1000).toFixed(1)}s)`);
	return flags;
}

// ============================================================ main

async function main() {
	let narrative;
	let campaignId = CAMPAIGN_ID;
	let sessionTitle = 'ad-hoc narrative';

	if (NARRATIVE_FILE) {
		narrative = fs.readFileSync(path.resolve(NARRATIVE_FILE), 'utf8');
		if (!narrative.trim()) {
			console.error(`
[X] ${NARRATIVE_FILE} is empty.
`);
			process.exit(1);
		}
	} else if (SESSION_ID) {
		const rows = await sb(`sessions?id=eq.${SESSION_ID}&select=id,title,narrative,campaign_id`);
		if (!rows.length) throw new Error(`No session ${SESSION_ID}`);
		narrative = rows[0].narrative;
		sessionTitle = rows[0].title;
		campaignId = campaignId || rows[0].campaign_id;
		if (!narrative || !narrative.trim()) {
			console.error(`
[X] Session "${sessionTitle}" has no narrative text. Nothing to extract.
`);
			process.exit(1);
		}
	} else {
		console.error(`
Usage:
  node test-pipeline.mjs --session <uuid>              reuse an existing session's narrative
  node test-pipeline.mjs --narrative file.txt --campaign <uuid>

Options:
  --passes A,B,C,D,R which passes to run (default all, R = review)
  --model <name>       default granite4.1:8b  (structure: discovery, typing, classification)
  --prose-model <name> optional second model for descriptions + event text
  --ctx <n>          default 8192 (discovery needs the whole narrative)
  --verbose          print every decision, and raw output on parse failure

Output caps (raise if --verbose shows "[parse fail]"):
  --out-discover <n> default 2048   pass A
  --out-describe <n> default 1200   pass B
  --out-pair <n>     default 300    pass C
  --out-events <n>   default 2048   pass D
`);
		process.exit(1);
	}

	const words = narrative.split(/\s+/).length;
	// Fantasy proper nouns tokenise worse than plain English, so 1.4 not 1.33.
	const narrativeTokens = Math.round(words * 1.4);
	const PROMPT_OVERHEAD = 500; // instructions + type list, largest in pass A
	const OUTPUT_BUDGET = 2048; // num_predict
	const needed = narrativeTokens + PROMPT_OVERHEAD + OUTPUT_BUDGET;

	console.log(`\nSource   : ${sessionTitle}`);
	console.log(`Narrative: ${words} words (~${narrativeTokens} tokens)`);
	console.log(`Campaign : ${campaignId || '(none — everything will look new)'}`);
	console.log(`Model    : ${MODEL}, ctx ${NUM_CTX}`);
	console.log(
		`Budget   : ${narrativeTokens} narrative + ${PROMPT_OVERHEAD} prompt + ${OUTPUT_BUDGET} output = ${needed} of ${NUM_CTX}`
	);

	if (needed > NUM_CTX) {
		const suggest = needed <= 12288 ? 12288 : 16384;
		console.log(`
[!] Passes A and D send the WHOLE narrative and need ~${needed} tokens.
    At ctx ${NUM_CTX} the narrative would be silently truncated — the model would
    simply not see the end of the session, and you would get no error.

    Fix (either works):
      --ctx ${suggest}                     more context; costs ~1-2GB extra VRAM
      --passes B,C                      skip A and D, which are the only
                                        passes needing the full text

    Check 'ollama ps' stays ~100% GPU after raising ctx. If it drops, the KV
    cache no longer fits and you will lose far more to CPU offload than you gain.
`);
	} else {
		const headroom = NUM_CTX - needed;
		console.log(`           headroom ${headroom} tokens${headroom < 500 ? '  [!] tight' : ''}`);
	}

	await preflight();

	const T0 = Date.now();
	const payload = { campaignId, sessionTitle, entities: [], updates: [], relationships: [], events: [] };

	let discovered = [];
	// Player characters must be excluded by NAME — pass A cannot know who they are,
	// and run 1 invented a bogus "player_character" category for them.
	let pcNames = [];
	if (campaignId) {
		try {
			const chars = await sb(`characters?campaign_id=eq.${campaignId}&select=name`);
			pcNames = chars.map((c) => c.name).filter(Boolean);
			console.log(`Player characters (excluded from discovery): ${pcNames.join(', ') || '(none found)'}`);
		} catch (e) {
			console.log(`[!] could not load player characters: ${e.message}`);
		}
	}

	if (PASSES.includes('A')) discovered = await passA(narrative, pcNames);

	let cast = [];
	if (PASSES.includes('B')) {
		const index = await loadExistingIndex(campaignId);
		console.log(`  existing entities in campaign: ${index.length}`);
		const { news, existing } = matchExisting(discovered, index);
		payload.entities = await passB2(news, narrative);
		payload.updates = await passB3(existing, narrative);
		cast = [
			...payload.entities,
			...existing.map((e) => ({
				ref: `existing_${e.existingId}`,
				name: e.name,
				type: e.type,
				aliases: e.aliases || [],
			})),
		];
	} else {
		cast = discovered.map((d) => ({
			ref: `${d.type}_${normName(d.name).replace(/\s+/g, '_')}`,
			...d,
		}));
	}

	// D BEFORE C: events are linkable entities, and their 'mention' links belong
	// in the same relationship list pass C contributes to.
	if (PASSES.includes('D')) {
		if (!cast.length) {
			console.log('\n[!] cast is empty — events will have no entity mentions.');
		}
		const { events, mentions } = await passD(narrative, cast);
		payload.events = events;
		payload.relationships.push(...mentions);
	}

	if (PASSES.includes('C')) {
		if (!cast.length) {
			console.log('\n=== PASS C: skipped — cast is empty ===');
			console.log('    Pass C needs entities. Run pass A (and ideally B) first:');
			console.log('      --passes A,B,C');
		} else {
			const rels = await passC(cast, narrative);
			payload.relationships.push(...rels);
		}
	}

	// Session -> entity 'mention' links: the union of everything appearing in any
	// event, mirroring what the admin Scanner applies at session level.
	if (payload.events.length) {
		const mentioned = new Set(
			payload.relationships.filter((r) => r.type === 'mention' && r.from.startsWith('event_')).map((r) => r.to)
		);
		for (const ref of mentioned) {
			const e = cast.find((c) => c.ref === ref);
			payload.relationships.push({
				from: 'SESSION',
				to: ref,
				type: 'mention',
				because: 'appears in this session',
				_names: `[session] -> ${e?.name || ref}`,
			});
		}
	}

	if (PASSES.includes('R')) {
		payload.reviewFlags = await passR(payload, narrative);
	}

	const mins = ((Date.now() - T0) / 1000 / 60).toFixed(1);

	console.log('\n' + '='.repeat(62));
	console.log('  PAYLOAD SUMMARY');
	console.log('='.repeat(62));
	const evMentions = payload.relationships.filter((r) => r.type === 'mention' && r.from.startsWith('event_')).length;
	const sessMentions = payload.relationships.filter((r) => r.from === 'SESSION').length;
	const semantic = payload.relationships.length - evMentions - sessMentions;

	console.log(`  new entities         ${payload.entities.length}`);
	console.log(
		`  existing to update   ${payload.updates.filter((u) => u.descriptionChanged).length} of ${payload.updates.length}`
	);
	console.log(`  timeline events      ${payload.events.length}`);
	console.log(`  relationships        ${payload.relationships.length} total`);
	console.log(`    semantic (pass C)  ${semantic}`);
	console.log(`    event -> entity    ${evMentions}`);
	console.log(`    session -> entity  ${sessMentions}`);
	const styleIssues = payload.entities.filter((e) => e._style?.violations?.length).length;
	if (payload.entities.length) console.log(`  style issues left    ${styleIssues} of ${payload.entities.length}`);
	if (payload.reviewFlags) console.log(`  review flags         ${payload.reviewFlags.length}`);
	console.log(`  total time           ${mins} min`);
	console.log('='.repeat(62));

	if (payload.entities.length) {
		console.log('\nNEW ENTITIES');
		for (const e of payload.entities) {
			console.log(`\n  ${e.name}  (${e.type})  ${e._style?.words ? e._style.words + 'w' : ''}`);
			console.log(`    ${e.description}`);
			if (e._style?.violations?.length) console.log(`    [style] ${e._style.violations.join('; ')}`);
			if (Object.keys(e.attributes).length) console.log(`    attrs: ${JSON.stringify(e.attributes)}`);
		}
	}
	const changed = payload.updates.filter((u) => u.descriptionChanged);
	if (changed.length) {
		console.log('\nDESCRIPTION UPDATES');
		for (const u of changed) {
			console.log(`\n  ${u.name} (${u.type})`);
			console.log(`    OLD: ${u.oldDescription.slice(0, 160)}`);
			console.log(`    NEW: ${u.newDescription.slice(0, 160)}`);
		}
	}
	if (payload.events.length) {
		console.log('\nTIMELINE EVENTS  (with their entity mentions)');
		for (const e of payload.events) {
			console.log(`\n  ${String(e.order).padStart(2)}. [${e.event_type}] ${e.title}`);
			console.log(`      ${e.description}`);
			const mine = payload.relationships.filter((r) => r.from === e.ref);
			if (mine.length) console.log(`      mentions: ${mine.map((m) => m._names.split('-> ')[1]).join(', ')}`);
			if (e._unmatched?.length) console.log(`      [!] unmatched: ${e._unmatched.join(', ')}`);
		}
	}

	const semanticRels = payload.relationships.filter((r) => r.type !== 'mention');
	if (semanticRels.length) {
		console.log('\nSEMANTIC RELATIONSHIPS (pass C)');
		for (const r of semanticRels) console.log(`  ${r._names}  [${r.type}]\n      "${r.because}"`);
	}

	if (payload.reviewFlags?.length) {
		console.log('\nREVIEW FLAGS  (Granite disagreed with its own earlier output)');
		for (const f of payload.reviewFlags) {
			console.log(`  [${f.kind}] ${f.name}`);
			console.log(`      ${f.problem}`);
		}
		console.log('\n  These are flagged, not removed. Check them first when reviewing.');
	}

	const out = path.resolve(import.meta.dirname, `import-payload-${Date.now()}.json`);
	fs.writeFileSync(out, JSON.stringify(payload, null, 2));
	console.log(`\nPayload: ${out}`);
	console.log('\nNothing was written to your database. Review the payload above.\n');
}

main().catch((e) => {
	console.error('\n[X]', e.message, '\n');
	process.exit(1);
});
