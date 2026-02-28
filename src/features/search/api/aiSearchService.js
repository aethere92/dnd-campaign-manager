/**
 * AI-powered search using Google Gemini.
 * Sends session synopses + events as context, returns natural language answers
 * with entity references the UI can link to.
 *
 * Fallback: on rate limit (429) or any error, caller should fall back to keyword search.
 */

import { supabase } from '@/shared/api/supabaseClient';

const SYSTEM_PROMPT = `You are a knowledgeable D&D campaign assistant. You have access to session synopses and detailed event logs from the campaign. Answer the user's question thoroughly and accurately.

Rules:
- Base your answer ONLY on the provided campaign data. Do not invent details.
- Be specific: mention session numbers, character names, locations, and key actions.
- Use entity names exactly as they appear in the data (correct spelling and capitalization matters).
- For "what happened" questions, provide a narrative summary covering the key beats.
- For character questions, describe their actions, decisions, and notable moments across sessions.
- If nothing in the data matches the query, respond with exactly: NO_RESULTS
- Keep answers under 400 words. Use markdown for readability (bold, lists, etc).`;

/** Rate limit cooldown tracker */
let rateLimitedUntil = 0;
const COOLDOWN_MS = 60_000;

/**
 * Check if AI search is currently rate-limited.
 */
export const isAiSearchCoolingDown = () => Date.now() < rateLimitedUntil;

/**
 * Build campaign context string from session synopses + events.
 */
async function buildCampaignContext(campaignId) {
	// Fetch sessions with synopses
	const { data: sessions } = await supabase
		.from('sessions')
		.select('id, title, attributes')
		.eq('campaign_id', campaignId)
		.order('attributes->session_number');

	if (!sessions?.length) return '';

	const sessionIds = sessions.map((s) => s.id);

	// Fetch all events for these sessions
	const { data: events } = await supabase
		.from('session_events')
		.select('session_id, title, description, event_order')
		.in('session_id', sessionIds)
		.order('event_order');

	// Group events by session
	const eventsBySession = new Map();
	(events || []).forEach((e) => {
		if (!eventsBySession.has(e.session_id)) eventsBySession.set(e.session_id, []);
		eventsBySession.get(e.session_id).push(e);
	});

	// Build context string
	let context = '';
	sessions.forEach((s) => {
		const num = s.attributes?.session_number || '?';
		const synopsis = s.attributes?.synopsis || '';
		context += `## Session ${num}: ${s.title}\n`;
		if (synopsis) context += `Synopsis: ${synopsis}\n`;

		const sessionEvents = eventsBySession.get(s.id) || [];
		sessionEvents.forEach((e) => {
			context += `- ${e.title}: ${e.description || ''}\n`;
		});
		context += '\n';
	});

	return context;
}

/**
 * Perform AI-powered search against campaign data.
 * @param {string} campaignId
 * @param {string} query - User's natural language query
 * @returns {Promise<{ answer: string, isAiResult: true } | null>}
 * @throws {Error} with status 429 on rate limit
 */
export async function aiSearch(campaignId, query) {
	if (isAiSearchCoolingDown()) {
		throw new Error('AI search is cooling down');
	}

	const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
	const model = 'gemini-2.5-flash';

	if (!apiKey) {
		console.error('[AI Search] No API key found. VITE_GEMINI_API_KEY is not set.');
		return null;
	}

	const context = await buildCampaignContext(campaignId);
	if (!context) return null;

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
			contents: [
				{
					role: 'user',
					parts: [{ text: `## Campaign Data\n${context}\n## Question\n${query}` }],
				},
			],
			generationConfig: {
				temperature: 0.3,
				maxOutputTokens: 2048,
			},
		}),
	});

	if (response.status === 429) {
		rateLimitedUntil = Date.now() + COOLDOWN_MS;
		console.error('[AI Search] Rate limited by Gemini API');
		throw new Error('Rate limited');
	}

	if (!response.ok) {
		const err = await response.text();
		console.error('[AI Search] Gemini API error:', response.status, err);
		throw new Error(`Gemini API error (${response.status}): ${err}`);
	}

	const data = await response.json();

	if (!data.candidates?.length) return null;

	const candidate = data.candidates[0];
	if (candidate.finishReason && candidate.finishReason !== 'STOP') return null;

	const answer = candidate.content?.parts?.[0]?.text || '';

	if (answer.trim() === 'NO_RESULTS') return null;

	return { answer, isAiResult: true };
}
