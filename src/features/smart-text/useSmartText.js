import { useMemo } from 'react';
import { useEntityIndex } from './useEntityIndex';

/**
 * Escape special regex characters
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Find non-overlapping entity mentions in text
 */
const findEntityMatches = (text, entityIndex) => {
	const matches = [];
	const processedRanges = [];

	// Sort by length DESC
	const sortedEntities = [...entityIndex].sort((a, b) => b.name.length - a.name.length);

	for (const entity of sortedEntities) {
		const pattern = new RegExp(`\\b${escapeRegex(entity.name)}\\b`, 'gi');
		let match;

		while ((match = pattern.exec(text)) !== null) {
			const start = match.index;
			const end = start + match[0].length;

			const overlaps = processedRanges.some(
				(range) =>
					(start >= range.start && start < range.end) ||
					(end > range.start && end <= range.end) ||
					(start <= range.start && end >= range.end)
			);

			if (!overlaps) {
				matches.push({ start, end, text: match[0], entity });
				processedRanges.push({ start, end });
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
	const { list: entityIndex } = useEntityIndex();

	const shouldProcess = useMemo(() => {
		if (!text || typeof text !== 'string' || text.length < 3) return false;
		if (!entityIndex || entityIndex.length === 0) return false;
		return true;
	}, [text, entityIndex]);

	return useMemo(() => {
		if (!shouldProcess) return text || '';

		try {
			// CRITICAL FIX: Split by existing Markdown links to protect them
			// Matches [text](url) pattern. The capturing group () keeps the delimiter in the result array.
			// This regex is basic but handles standard single-line links.
			const linkProtectionRegex = /(\[.*?\]\(.*?\))/g;
			const parts = text.split(linkProtectionRegex);

			// Process only the parts that ARE NOT links
			const processedParts = parts.map((part) => {
				// Simple check: does it look like a markdown link?
				if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
					return part; // Return existing link as-is (Protected)
				}

				// Otherwise, auto-link entities in this plain text segment
				const matches = findEntityMatches(part, entityIndex);
				return replaceMatches(part, matches);
			});

			return processedParts.join('');
		} catch (err) {
			console.error('SmartMarkdown processing error:', err);
			return text;
		}
	}, [text, entityIndex, shouldProcess]);
}
