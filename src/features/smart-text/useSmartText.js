import { useMemo } from 'react';
import { useEntityIndex } from './useEntityIndex';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findEntityMatches = (text, searchTokens, entityMap) => {
	const matches = [];
	const processedRanges = [];

	if (!searchTokens || searchTokens.length === 0) return [];

	for (const token of searchTokens) {
		// Use standard Word Boundaries (\b) for matching
		const pattern = new RegExp(`\\b${escapeRegex(token.term)}\\b`, 'gi');
		let match;

		while ((match = pattern.exec(text)) !== null) {
			const start = match.index;
			const end = start + token.term.length;

			// Check overlap
			const overlaps = processedRanges.some(
				(range) =>
					(start >= range.start && start < range.end) ||
					(end > range.start && end <= range.end) ||
					(start <= range.start && end >= range.end)
			);

			if (!overlaps) {
				const entity = entityMap.get(token.entityId);
				if (entity) {
					// CHANGED: Use text.slice(start, end) to grab the ACTUAL text
					// (e.g., "the Arcane Brotherhood") instead of token.term ("The Arcane Brotherhood")
					matches.push({
						start,
						end,
						text: text.slice(start, end),
						entity,
					});
					processedRanges.push({ start, end });
				}
			}
		}
	}

	return matches.sort((a, b) => a.start - b.start);
};

const replaceMatches = (text, matches) => {
	if (matches.length === 0) return text;
	let result = '';
	let lastIndex = 0;
	for (const match of matches) {
		result += text.slice(lastIndex, match.start);
		result += `[${match.text}](#entity/${match.entity.id}/${match.entity.type})`;
		lastIndex = match.end;
	}
	result += text.slice(lastIndex);
	return result;
};

export function useSmartText(text) {
	const { searchTokens, map } = useEntityIndex();

	const shouldProcess = useMemo(() => {
		if (!text || typeof text !== 'string' || text.length < 3) return false;
		if (!searchTokens || searchTokens.length === 0) return false;
		return true;
	}, [text, searchTokens]);

	return useMemo(() => {
		if (!shouldProcess) return text || '';

		try {
			const linkProtectionRegex = /(\[.*?\]\(.*?\))/g;
			const parts = text.split(linkProtectionRegex);

			const processedParts = parts.map((part) => {
				if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
					return part;
				}
				const matches = findEntityMatches(part, searchTokens, map);
				return replaceMatches(part, matches);
			});

			return processedParts.join('');
		} catch (err) {
			console.error('SmartMarkdown processing error:', err);
			return text;
		}
	}, [text, searchTokens, map, shouldProcess]);
}
