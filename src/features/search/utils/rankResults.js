import { tokenize } from '@/features/search/utils/queryParser';

/**
 * Score and order keyword-search results so the best match is first, and expose
 * which terms matched (for highlighting). Pure functions — no state, no network.
 *
 * The database returns rows that match ANY search word, in no meaningful order. A
 * result that hits more of the words, hits them in the name (not just the body),
 * or matches a whole word exactly is more relevant — this encodes that.
 */

/**
 * Relevance score for one result against the search terms. Higher = better.
 *   +50  the WHOLE name equals the query exactly (you typed the thing's name)
 *   +10  term appears in the NAME
 *   +3   term appears in the DESCRIPTION
 *   +5   bonus when a name match is a whole word (not a substring)
 *   +8   bonus when the name starts with a term (strong signal for "kael…")
 *
 * The exact-name bonus is what makes searching "Kaedin" put the character named
 * exactly Kaedin above an event like "Kaedin Visits the Wizard".
 */
export const scoreResult = (result, terms) => {
	if (!terms || terms.length === 0) return 0;

	const name = (result.name || '').toLowerCase().trim();
	const desc = (result.description || '').toLowerCase();
	const nameWords = name.split(/\s+/);

	let score = 0;

	// Whole-name exact match against the joined query terms.
	if (name === terms.join(' ')) score += 50;

	for (const term of terms) {
		if (name.includes(term)) {
			score += 10;
			if (nameWords.includes(term)) score += 5;
			if (name.startsWith(term)) score += 8;
		}
		if (desc.includes(term)) score += 3;
	}
	return score;
};

/**
 * Sort a copy of `results` by descending relevance to `query`. Ties keep their
 * original order (stable), so DB ordering still breaks ties sensibly.
 */
export const rankResults = (results, query) => {
	const terms = tokenize(query);
	if (terms.length === 0) return results;

	return results
		.map((r, i) => ({ r, i, s: scoreResult(r, terms) }))
		.sort((a, b) => b.s - a.s || a.i - b.i)
		.map((x) => x.r);
};

/**
 * Split `text` into segments tagged as matched / unmatched, for highlighting.
 * Matches whole occurrences of any term, case-insensitively. Returns
 * [{ text, match }] so the renderer can wrap matched runs.
 */
export const highlightSegments = (text, query) => {
	const source = text || '';
	const terms = tokenize(query).filter(Boolean);
	if (terms.length === 0 || !source) return [{ text: source, match: false }];

	// Build one regex of all terms; escape regex metachars in each term.
	const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	const re = new RegExp(`(${escaped.join('|')})`, 'gi');

	const segments = [];
	let last = 0;
	let m;
	while ((m = re.exec(source)) !== null) {
		if (m.index > last) segments.push({ text: source.slice(last, m.index), match: false });
		segments.push({ text: m[0], match: true });
		last = m.index + m[0].length;
		if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width
	}
	if (last < source.length) segments.push({ text: source.slice(last), match: false });
	return segments;
};
