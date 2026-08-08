/**
 * Deterministic proper-noun check.
 *
 * Real failure from a test run: pass A returned an npc named "ancient turtle" —
 * lowercase, a description rather than a name. It passed every existing guard,
 * because it IS present in the narrative and its category IS valid.
 *
 * English prose capitalises proper nouns. So the test is not "is this in the
 * text" but "does it appear CAPITALISED in the text". No model needed.
 */

/** Words that stay lowercase inside a legitimate proper noun. */
const MINOR_WORDS = new Set([
	'of',
	'the',
	'a',
	'an',
	'and',
	'in',
	'on',
	'at',
	'to',
	'for',
	'de',
	'la',
	'le',
	'von',
	'van',
]);

/** Leading articles to ignore when judging ("the Witchwood" -> "Witchwood"). */
const LEADING_ARTICLE = /^(the|a|an)\s+/i;

/**
 * Descriptor words that signal a description rather than a name when they lead.
 * Only used for the reason string — the capitalisation test does the real work.
 */
const DESCRIPTOR_LEAD = new Set([
	'ancient',
	'old',
	'young',
	'large',
	'small',
	'giant',
	'huge',
	'tiny',
	'strange',
	'mysterious',
	'dead',
	'dying',
	'wounded',
	'captured',
	'unnamed',
	'nameless',
	'first',
	'second',
	'another',
	'wild',
	'feral',
	'lost',
	'broken',
	'abandoned',
	'hidden',
	'secret',
]);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @param {string} name       candidate name as the model returned it
 * @param {string} narrative  source text
 * @returns {{ok: boolean, reason: string, suggestion: string|null}}
 */
export function checkProperNoun(name, narrative) {
	const raw = (name || '').trim();
	if (!raw) return { ok: false, reason: 'empty name', suggestion: null };

	const stripped = raw.replace(LEADING_ARTICLE, '').trim();
	if (!stripped) return { ok: false, reason: 'only an article', suggestion: null };

	const words = stripped.split(/\s+/);
	const significant = words.filter((w) => !MINOR_WORDS.has(w.toLowerCase()));
	if (!significant.length) return { ok: false, reason: 'no significant words', suggestion: null };

	// How does this name actually appear in the source? Search case-insensitively,
	// then inspect the casing of what we found.
	const re = new RegExp(escapeRe(stripped), 'gi');
	const occurrences = narrative.match(re) || [];

	if (!occurrences.length) {
		return { ok: false, reason: 'not found in narrative', suggestion: null };
	}

	// Accept if ANY occurrence has every significant word capitalised. Requiring
	// all occurrences would reject names that appear lowercase once in dialogue.
	const capitalisedOccurrence = occurrences.find((occ) => {
		const occWords = occ.split(/\s+/).filter((w) => !MINOR_WORDS.has(w.toLowerCase()));
		return occWords.length > 0 && occWords.every((w) => /^[A-Z]/.test(w));
	});

	if (capitalisedOccurrence) {
		// Return the source's own casing — the model sometimes lowercases a real name.
		return { ok: true, reason: 'capitalised in narrative', suggestion: capitalisedOccurrence.trim() };
	}

	const lead = words[0].toLowerCase();
	const reason = DESCRIPTOR_LEAD.has(lead)
		? `descriptive phrase, never capitalised in text (leads with "${lead}")`
		: 'never capitalised in narrative — appears to be a description, not a name';

	return { ok: false, reason, suggestion: null };
}
