/**
 * Deterministic style checks on generated prose.
 *
 * Small models drift back to "X is a…" and to hedging even when told not to, so
 * the violations are detected in code rather than trusted to the prompt. Cheap,
 * consistent, and it tells you WHICH rule broke — which is what makes the style
 * guide tunable.
 *
 * Returns violations; it does not rewrite. The pipeline uses these to decide
 * whether to retry a generation once.
 */

import { LENGTH_TARGETS } from './style-guide.mjs';

const HEDGES = [
	'may have',
	'might have',
	'it is possible',
	'possibly',
	'perhaps',
	'seems to',
	'appears to be',
	'could be',
	'presumably',
	'likely that',
];

const FILLER = [
	'in summary',
	'overall',
	'in conclusion',
	'it should be noted',
	'notably',
	'remarkably',
	'truly',
	'very ',
	'quite ',
	'this entry',
	'this description',
];

/**
 * @param {string} text  generated description
 * @param {string} kind  entity type or 'event'
 * @param {string} name  entity name, to detect "Name is a…" openings
 * @returns {{violations: string[], words: number, sentences: number}}
 */
export function checkStyle(text, kind, name = '') {
	const v = [];
	const t = (text || '').trim();
	if (!t) return { violations: ['empty'], words: 0, sentences: 0 };

	const words = t.split(/\s+/).length;
	const sentences = t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 1);
	const lower = t.toLowerCase();

	// --- rule 1: no "X is a…" opening -----------------------------------------
	const firstSentence = sentences[0] || t;
	if (/^(he|she|it|they|this|the)\s+(is|was|are|were)\b/i.test(firstSentence)) {
		v.push('opens with "It is/This is" — use a bare noun phrase');
	}
	if (name) {
		const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		if (new RegExp(`^${esc}\\s+(is|was)\\b`, 'i').test(firstSentence)) {
			v.push(`opens with "${name} is…" — use a bare noun phrase`);
		}
	}
	// "A location that is..." — opening by defining the category
	if (new RegExp(`^(a|an|the)\\s+${kind}\\b`, 'i').test(firstSentence)) {
		v.push(`opens by naming its own category ("${kind}")`);
	}
	// Observed leak: the TYPE_SPECS hint text reproduced verbatim, e.g.
	// "A named individual who is not a player character."
	if (/named individual who is not a player character|an? organised group:|a place: region/i.test(t)) {
		v.push('reproduces the schema hint text instead of describing the entity');
	}

	// --- rule: length ---------------------------------------------------------
	const target = LENGTH_TARGETS[kind] || LENGTH_TARGETS.npc;
	const [minW, maxW] = target.words.split('-').map(Number);
	if (words < minW * 0.6) v.push(`too short: ${words}w (target ${target.words})`);
	if (words > maxW * 1.5) v.push(`too long: ${words}w (target ${target.words})`);

	// --- rule 6: no hedging or filler ----------------------------------------
	for (const h of HEDGES) if (lower.includes(h)) v.push(`hedging: "${h.trim()}"`);
	for (const f of FILLER) if (lower.includes(f)) v.push(`filler: "${f.trim()}"`);

	// --- rule 5: em-dash used, not overused ----------------------------------
	const dashes = (t.match(/—/g) || []).length;
	if (dashes > 4) v.push(`${dashes} em-dashes — at most two`);

	// --- second person -------------------------------------------------------
	if (/\byou\b|\byour\b/i.test(t)) v.push('addresses the reader ("you")');

	// --- rule 4: sentence rhythm --------------------------------------------
	if (sentences.length >= 3) {
		const lens = sentences.map((s) => s.split(/\s+/).length);
		const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
		if (avg < 10) v.push(`choppy: avg ${Math.round(avg)}w/sentence (target 20-26)`);
		const spread = Math.max(...lens) - Math.min(...lens);
		if (spread < 4 && sentences.length > 3) v.push('uniform sentence lengths — vary the rhythm');
	}

	return { violations: v, words, sentences: sentences.length };
}
