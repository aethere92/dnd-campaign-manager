import { useMemo } from 'react';
import { useEntityIndex } from './useEntityIndex';

/**
 * Escape special regex characters
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Find non-overlapping entity mentions in text
 * Uses greedy matching (longest names first) to handle nested entities
 */
const findEntityMatches = (text, entityIndex) => {
	const matches = [];
	const processedRanges = [];

	// Sort by length DESC to match "Loïc the Phoenix" before "Loïc"
	const sortedEntities = [...entityIndex].sort((a, b) => b.name.length - a.name.length);

	for (const entity of sortedEntities) {
		// Create word-boundary regex for this entity
		const pattern = new RegExp(`\\b${escapeRegex(entity.name)}\\b`, 'gi');
		let match;

		while ((match = pattern.exec(text)) !== null) {
			const start = match.index;
			const end = start + match[0].length;

			// Check if this range overlaps with any processed range
			const overlaps = processedRanges.some(
				(range) =>
					(start >= range.start && start < range.end) ||
					(end > range.start && end <= range.end) ||
					(start <= range.start && end >= range.end)
			);

			if (!overlaps) {
				matches.push({
					start,
					end,
					text: match[0],
					entity,
				});
				processedRanges.push({ start, end });
			}
		}
	}

	// Sort by position for reconstruction
	return matches.sort((a, b) => a.start - b.start);
};

/**
 * Replace entity mentions with markdown links
 */
const replaceMatches = (text, matches) => {
	if (matches.length === 0) return text;

	let result = '';
	let lastIndex = 0;

	for (const match of matches) {
		// Add text before match
		result += text.slice(lastIndex, match.start);

		// Add markdown link
		result += `[${match.text}](#entity/${match.entity.id}/${match.entity.type})`;

		lastIndex = match.end;
	}

	// Add remaining text
	result += text.slice(lastIndex);

	return result;
};

/**
 * Parses text and injects markdown links for known entities.
 * OPTIMIZED: Added threshold checks and better memoization
 *
 * @param {string} text
 * @returns {string} The processed markdown string
 */
export function useSmartText(text) {
	const entityIndex = useEntityIndex();

	// OPTIMIZATION 1: Early exit checks (before expensive useMemo)
	const shouldProcess = useMemo(() => {
		// Don't process empty, short, or null text
		if (!text || typeof text !== 'string' || text.length < 3) return false;

		// Don't process if no entities loaded
		if (!entityIndex || entityIndex.length === 0) return false;

		// Don't process very short text (performance trade-off)
		// You can adjust this threshold based on your use case
		if (text.length < 10) return false;

		return true;
	}, [text, entityIndex.length]); // Only re-check when text or index count changes

	return useMemo(() => {
		if (!shouldProcess) return text || '';

		try {
			const matches = findEntityMatches(text, entityIndex);
			return replaceMatches(text, matches);
		} catch (err) {
			console.error('SmartMarkdown processing error:', err);
			return text; // Fallback to original
		}
	}, [text, entityIndex, shouldProcess]); // Better dependency array
}
