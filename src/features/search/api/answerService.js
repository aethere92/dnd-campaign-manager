import { supabase } from '@/shared/api/supabaseClient';

/**
 * Structured answers for the recognised question shapes (see queryParser).
 *
 * These are plain relational queries over the existing links:
 *   session (by number) → session_events → entity_relationships('mention') → entity
 * No model, no network beyond Supabase. Each returns a small object the AnswerCard
 * renders, or null when the question can't be answered (e.g. no such session).
 */

/** Resolve a session by its human number (stored in sessions.attributes). */
const findSessionByNumber = async (campaignId, sessionNumber) => {
	const { data, error } = await supabase
		.from('sessions')
		.select('id, title, attributes')
		.eq('campaign_id', campaignId)
		.eq('attributes->>session_number', String(sessionNumber))
		.maybeSingle();
	if (error) throw error;
	return data;
};

/**
 * Fuzzy-ish match of a typed name against candidate entities. Not a real fuzzy
 * lib — just case-insensitive exact, then startsWith, then substring, then
 * first-name — enough that "kael" matches "Kael Stormborn".
 */
const pickBestEntity = (candidates, typedName) => {
	const q = typedName.toLowerCase().trim();
	const byName = candidates.map((c) => ({ c, n: (c.name || '').toLowerCase() }));

	return (
		byName.find((x) => x.n === q)?.c ||
		byName.find((x) => x.n.startsWith(q))?.c ||
		byName.find((x) => x.n.includes(q))?.c ||
		byName.find((x) => x.n.split(/\s+/)[0] === q)?.c ||
		null
	);
};

/**
 * "What did {entity} do in session {N}?"
 * → the session's events that mention {entity}.
 */
export const answerCharacterInSession = async (campaignId, { entityName, sessionNumber }) => {
	const session = await findSessionByNumber(campaignId, sessionNumber);
	if (!session) return { pattern: 'char-in-session', notFound: `session ${sessionNumber}` };

	// Candidate entities matching the typed name (name ilike), then pick the best.
	const { data: matches, error: matchErr } = await supabase
		.from('entities')
		.select('id, name, type')
		.eq('campaign_id', campaignId)
		.neq('type', 'event')
		.ilike('name', `%${entityName}%`)
		.limit(10);
	if (matchErr) throw matchErr;

	const entity = pickBestEntity(matches || [], entityName);
	if (!entity) return { pattern: 'char-in-session', session, notFound: entityName };

	// Events in this session (session_events.session_id), then filter to those that
	// mention the entity via entity_relationships (from=event, to=entity).
	const { data: events, error: evErr } = await supabase
		.from('session_events')
		.select('id, title, description, event_order')
		.eq('session_id', session.id)
		.order('event_order', { ascending: true });
	if (evErr) throw evErr;

	if (!events || events.length === 0) {
		return { pattern: 'char-in-session', session, entity, events: [] };
	}

	const eventIds = events.map((e) => e.id);
	const { data: rels, error: relErr } = await supabase
		.from('entity_relationships')
		.select('from_entity_id')
		.eq('to_entity_id', entity.id)
		.in('from_entity_id', eventIds);
	if (relErr) throw relErr;

	const mentionedIds = new Set((rels || []).map((r) => r.from_entity_id));
	const involved = events.filter((e) => mentionedIds.has(e.id));

	return { pattern: 'char-in-session', session, entity, events: involved };
};

/**
 * "What happened in session {N}?" / "Who was in session {N}?"
 * → all of the session's events, plus the distinct entities they mention.
 */
export const answerSessionSummary = async (campaignId, { sessionNumber }) => {
	const session = await findSessionByNumber(campaignId, sessionNumber);
	if (!session) return { pattern: 'session-summary', notFound: `session ${sessionNumber}` };

	const { data: events, error: evErr } = await supabase
		.from('session_events')
		.select('id, title, description, event_order')
		.eq('session_id', session.id)
		.order('event_order', { ascending: true });
	if (evErr) throw evErr;

	let participants = [];
	if (events && events.length > 0) {
		const eventIds = events.map((e) => e.id);
		const { data: rels, error: relErr } = await supabase
			.from('entity_relationships')
			.select('to:entities!to_entity_id ( id, name, type )')
			.in('from_entity_id', eventIds);
		if (relErr) throw relErr;

		// Distinct participants by id.
		const seen = new Map();
		(rels || []).forEach((r) => {
			if (r.to && !seen.has(r.to.id)) seen.set(r.to.id, r.to);
		});
		participants = [...seen.values()];
	}

	return { pattern: 'session-summary', session, events: events || [], participants };
};

/** Dispatch a parsed question to its answer function. */
export const answerQuestion = async (campaignId, { pattern, slots }) => {
	switch (pattern) {
		case 'char-in-session':
			return answerCharacterInSession(campaignId, slots);
		case 'session-summary':
			return answerSessionSummary(campaignId, slots);
		default:
			return null;
	}
};
