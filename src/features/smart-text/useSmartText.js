import { useMemo } from 'react';
import { useEntityIndex } from './useEntityIndex';

/**
 * Parses text and injects markdown links for known entities.
 * @param {string} text
 * @returns {string} The processed markdown string
 */
export function useSmartText(text) {
	const entityIndex = useEntityIndex();

	return useMemo(() => {
		// 1. Guard Clauses
		if (!text || typeof text !== 'string') return text || '';
		if (!entityIndex || entityIndex.length === 0) return text;
		if (text.length < 3) return text;

		try {
			// 2. Build Regex
			// Escape special regex characters in names (e.g., "Grog's Axe" -> "Grog\'s Axe")
			const escapedNames = entityIndex.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			const pattern = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

			// 3. Find Matches
			const matches = [];
			let match;
			while ((match = pattern.exec(text)) !== null) {
				const entity = entityIndex.find((e) => e.name.toLowerCase() === match[0].toLowerCase());
				if (entity) {
					matches.push({
						start: match.index,
						end: match.index + match[0].length,
						text: match[0],
						entity,
					});
				}
			}

			// 4. Filter Overlaps (Simple strategy: greedy sort was done in fetch)
			// Since we process linearly, we just need to reconstruct the string
			if (matches.length === 0) return text;

			let result = '';
			let lastIndex = 0;

			// Sort matches by position to ensure correct string reconstruction
			matches.sort((a, b) => a.start - b.start);

			for (const m of matches) {
				// Prevent overlapping matches (e.g. nested words)
				if (m.start < lastIndex) continue;

				// Add text before match
				result += text.slice(lastIndex, m.start);

				// Add the "Smart Link" markdown syntax
				// Format: [Name](#entity/UUID/type)
				result += `[${m.text}](#entity/${m.entity.id}/${m.entity.type})`;

				lastIndex = m.end;
			}

			// Add remaining text
			result += text.slice(lastIndex);

			return result;
		} catch (err) {
			console.error('SmartMarkdown processing error:', err);
			return text; // Fallback to original
		}
	}, [text, entityIndex]);
}
