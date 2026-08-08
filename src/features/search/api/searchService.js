import { supabase } from '@/shared/api/supabaseClient';
import { tokenize } from '@/features/search/utils/queryParser';

// Escape PostgREST or-filter metacharacters in a user term. Commas and parens
// would otherwise break out of the .or(...) grouping.
const escapeTerm = (t) => t.replace(/[,()]/g, ' ');

export const globalSearch = async (campaignId, query) => {
	if (!query || query.trim().length === 0) return { sessions: [], entities: [], sessionAttributes: [] };

	// Match on meaningful words rather than the literal phrase, so "who is the red
	// wizard" finds an entity matching "red" OR "wizard". Falls back to the whole
	// trimmed string if tokenizing leaves nothing (e.g. an all-stopword query).
	const terms = tokenize(query);
	const effectiveTerms = terms.length > 0 ? terms : [query.trim()];

	const nameFilter = effectiveTerms.map((t) => `name.ilike.%${escapeTerm(t)}%`).join(',');
	const descFilter = effectiveTerms.map((t) => `description.ilike.%${escapeTerm(t)}%`).join(',');
	const titleFilter = effectiveTerms.map((t) => `title.ilike.%${escapeTerm(t)}%`).join(',');
	const narrativeFilter = effectiveTerms.map((t) => `narrative.ilike.%${escapeTerm(t)}%`).join(',');

	// 1. Search Entities — name matches and description matches are fetched
	// SEPARATELY, then merged. Doing it in one query with a shared LIMIT meant a
	// common name (e.g. the main character, mentioned in 50+ descriptions) could
	// be starved out of the results entirely — searching "Kaedin" returned every
	// entity that MENTIONS Kaedin but not Kaedin himself. Name matches are the
	// strongest signal, so they get their own budget and always survive.
	const [nameRes, descRes] = await Promise.all([
		supabase
			.from('entities')
			.select('id, name, type, description')
			.eq('campaign_id', campaignId)
			.or(nameFilter)
			.limit(10),
		supabase
			.from('entities')
			.select('id, name, type, description')
			.eq('campaign_id', campaignId)
			.or(descFilter)
			.limit(8),
	]);

	if (nameRes.error) console.error('Entity name search error:', nameRes.error);
	if (descRes.error) console.error('Entity description search error:', descRes.error);

	// Merge, name matches first, de-duplicated by id.
	const seen = new Set();
	const entities = [];
	for (const row of [...(nameRes.data || []), ...(descRes.data || [])]) {
		if (seen.has(row.id)) continue;
		seen.add(row.id);
		entities.push(row);
	}

	// 2. Search Sessions (title matches prioritised over narrative, same reasoning)
	const [sessTitleRes, sessNarrRes] = await Promise.all([
		supabase.from('sessions').select('id, title, narrative').eq('campaign_id', campaignId).or(titleFilter).limit(5),
		supabase.from('sessions').select('id, title, narrative').eq('campaign_id', campaignId).or(narrativeFilter).limit(5),
	]);

	if (sessTitleRes.error) console.error('Session title search error:', sessTitleRes.error);
	if (sessNarrRes.error) console.error('Session narrative search error:', sessNarrRes.error);

	const seenSessions = new Set();
	const sessions = [];
	for (const row of [...(sessTitleRes.data || []), ...(sessNarrRes.data || [])]) {
		if (seenSessions.has(row.id)) continue;
		seenSessions.add(row.id);
		sessions.push(row);
	}

	// 3. Fetch Attributes for Sessions (if any found)
	let sessionAttributes = [];
	if (sessions && sessions.length > 0) {
		const sessionIds = sessions.map((s) => s.id);
		const { data } = await supabase.from('attributes').select('entity_id, name, value').in('entity_id', sessionIds);
		sessionAttributes = data || [];
	}

	return {
		sessions: sessions || [],
		entities: entities || [],
		sessionAttributes,
	};
};
