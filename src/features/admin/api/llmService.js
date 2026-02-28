/**
 * Client-side LLM service for narrative analysis.
 * Calls Google Gemini API (AI Studio) directly from the browser.
 */

const SYSTEM_PROMPT = `You are a D&D campaign analyst. Given a session narrative and a list of entities that appear in it, infer meaningful relationships BETWEEN the entities (not between entities and the session).

Rules:
- Only suggest relationships clearly supported by the narrative text.
- Use ONLY relationship types from the provided list.
- Each suggestion needs: fromEntityId, toEntityId, relationshipType, isBidirectional, reason (one short sentence).
- Do NOT suggest relationships that are purely spatial co-occurrence (e.g., two characters being in the same room doesn't mean they have a relationship unless they interact).
- Focus on interactions: conversations, combat, alliances, betrayals, trades, discoveries.
- Return valid JSON array. If no relationships are found, return [].`;

/**
 * Build the user prompt with narrative + entity context.
 */
function buildPrompt(narrative, entities, relationshipTypes) {
	const entityList = entities
		.map((e) => `- ${e.entityName} (${e.entityType}, id: ${e.entityId})`)
		.join('\n');

	return `## Session Narrative
${narrative}

## Entities Found in Narrative
${entityList}

## Allowed Relationship Types
${relationshipTypes.join(', ')}

## Task
Analyze the narrative and suggest entity-to-entity relationships. Return a JSON array:
[{ "fromEntityId": "...", "toEntityId": "...", "relationshipType": "...", "isBidirectional": true/false, "reason": "..." }]`;
}

/**
 * Call the Gemini API and parse relationship suggestions.
 * @param {string} narrative - Session narrative text
 * @param {Array} entities - Detected entities [{ entityId, entityName, entityType }]
 * @param {Array} relationshipTypes - Allowed relationship type strings
 * @returns {Promise<Array>} Parsed suggestions
 */
export async function inferRelationships(narrative, entities, relationshipTypes) {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
	const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

	if (!apiKey) {
		throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
	}

	if (entities.length < 2) {
		throw new Error(`Need at least 2 entities for relationship inference, found ${entities.length}`);
	}

	const userPrompt = buildPrompt(narrative, entities, relationshipTypes);
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

	console.log(`[LLM] Calling Gemini (${model}) with ${entities.length} entities...`);

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			systemInstruction: {
				parts: [{ text: SYSTEM_PROMPT }],
			},
			contents: [
				{
					role: 'user',
					parts: [{ text: userPrompt }],
				},
			],
			generationConfig: {
				temperature: 0.3,
				maxOutputTokens: 8192,
				responseMimeType: 'application/json',
				thinkingConfig: {
					thinkingBudget: 0,
				},
			},
		}),
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Gemini API error (${response.status}): ${err}`);
	}

	const data = await response.json();
	console.log('[LLM] Gemini raw response:', JSON.stringify(data).slice(0, 500));

	// Check for blocked content or empty candidates
	if (!data.candidates || data.candidates.length === 0) {
		const reason = data.promptFeedback?.blockReason || 'unknown';
		throw new Error(`Gemini returned no candidates (blockReason: ${reason})`);
	}

	const candidate = data.candidates[0];
	if (candidate.finishReason && candidate.finishReason !== 'STOP') {
		throw new Error(`Gemini finished with reason: ${candidate.finishReason}`);
	}

	const content = candidate.content?.parts?.[0]?.text || '[]';
	console.log('[LLM] Gemini content text:', content.slice(0, 300));

	// Parse JSON — with responseMimeType set, content should be clean JSON
	let parsed;
	try {
		parsed = JSON.parse(content);
	} catch {
		// Fallback: try to extract JSON array from text
		const jsonMatch = content.match(/\[[\s\S]*\]/);
		if (!jsonMatch) {
			throw new Error('Could not parse Gemini response as JSON');
		}
		parsed = JSON.parse(jsonMatch[0]);
	}

	// Handle both array and object-with-array responses
	const suggestions = Array.isArray(parsed) ? parsed : (parsed.relationships || parsed.suggestions || []);

	const valid = suggestions.filter(
		(s) =>
			s.fromEntityId &&
			s.toEntityId &&
			s.relationshipType &&
			typeof s.isBidirectional === 'boolean' &&
			s.reason
	);

	console.log(`[LLM] Parsed ${valid.length} valid suggestions from ${suggestions.length} raw`);
	return valid;
}
