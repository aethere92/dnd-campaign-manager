/**
 * Turns a raw search box string into one of two things:
 *
 *   { kind: 'question', pattern, slots }  — a structured question we can answer
 *                                            from the data model (see answerService)
 *   { kind: 'search', terms }             — plain keyword search, for everything else
 *
 * This is deliberately NOT general natural-language understanding. It recognises a
 * small, fixed set of question *shapes* whose answers are lookups in the linked
 * data (sessions ↔ events ↔ mentioned entities), and falls back to keyword search
 * for anything it doesn't recognise. No model, no network — just patterns.
 */

// Filler words dropped from keyword search so "who is the red wizard" matches on
// "red"/"wizard" rather than the literal phrase.
const STOPWORDS = new Set([
	'a',
	'an',
	'the',
	'is',
	'are',
	'was',
	'were',
	'of',
	'in',
	'on',
	'at',
	'to',
	'for',
	'and',
	'or',
	'with',
	'who',
	'what',
	'where',
	'when',
	'did',
	'do',
	'does',
	'that',
	'this',
	'it',
	'as',
	'by',
	'from',
	'about',
	'into',
	'me',
	'my',
	'i',
]);

/** Split into meaningful lowercase words, dropping stopwords and punctuation. */
export const tokenize = (text) => {
	return (text || '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, ' ') // strip punctuation (unicode-aware)
		.split(/\s+/)
		.filter((w) => w.length > 0 && !STOPWORDS.has(w));
};

/**
 * Question shapes we can answer. Each entry has a regex with named-ish capture
 * groups and a builder that maps the match to typed slots. Ordered most- to
 * least-specific; first match wins.
 */
const QUESTION_PATTERNS = [
	{
		pattern: 'char-in-session',
		// "what did Kael do in session 5", "what did Kael Stormborn do in session 5?"
		// Also tolerates "what happened to Kael in session 5".
		regex: /what (?:did|happened to) (.+?) (?:do |get up to )?in session\s+#?(\d+)/i,
		build: (m) => ({ entityName: m[1].trim(), sessionNumber: Number(m[2]) }),
	},
	{
		pattern: 'session-summary',
		// "what happened in session 5", "who was in session 3"
		regex: /(?:what happened|who(?:'s| was| is| were)?(?: present)?|what went on) in session\s+#?(\d+)/i,
		build: (m) => ({ sessionNumber: Number(m[1]) }),
	},
];

/**
 * Parse a query. Returns a question descriptor if it matches a known shape,
 * otherwise a keyword-search descriptor. Empty input → null.
 */
export const parseQuery = (text) => {
	const trimmed = (text || '').trim();
	if (!trimmed) return null;

	for (const { pattern, regex, build } of QUESTION_PATTERNS) {
		const m = trimmed.match(regex);
		if (m) {
			return { kind: 'question', pattern, slots: build(m) };
		}
	}

	return { kind: 'search', terms: tokenize(trimmed) };
};
