/**
 * Markdown-specific Utilities
 * Header extraction, ToC generation, etc.
 */

import { generateId } from './textProcessing';

/**
 * Extract headers from markdown text
 * @param {string} markdown - Markdown text
 * @returns {Array<{depth: number, text: string, id: string}>}
 */
export const extractHeaders = (markdown) => {
	if (!markdown) return [];

	const regex = /^(#{1,3})\s+(.+)$/gm;
	const headers = [];
	let match;

	while ((match = regex.exec(markdown)) !== null) {
		headers.push({
			depth: match[1].length, // 1, 2, or 3
			text: match[2].trim(),
			id: generateId(match[2]),
		});
	}

	return headers;
};

/**
 * Generate Table of Contents from markdown
 * @param {string} markdown - Markdown text
 * @param {number} maxDepth - Maximum heading depth (default 3)
 * @returns {Array<{depth: number, text: string, id: string}>}
 */
export const generateToC = (markdown, maxDepth = 3) => {
	const headers = extractHeaders(markdown);
	return headers.filter((h) => h.depth <= maxDepth);
};

/**
 * Convert markdown to plain text (strips formatting)
 * @param {string} markdown - Markdown text
 * @returns {string}
 */
export const markdownToText = (markdown) => {
	if (!markdown) return '';

	return markdown
		.replace(/#{1,6}\s+/g, '') // Headers
		.replace(/\*\*(.+?)\*\*/g, '$1') // Bold
		.replace(/\*(.+?)\*/g, '$1') // Italic
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
		.replace(/`(.+?)`/g, '$1') // Code
		.replace(/^>\s+/gm, '') // Blockquotes
		.replace(/^[-*+]\s+/gm, '') // Lists
		.replace(/^\d+\.\s+/gm, '') // Ordered lists
		.trim();
};

/**
 * Extract excerpt from markdown (first paragraph)
 * @param {string} markdown - Markdown text
 * @param {number} maxLength - Maximum length (default 200)
 * @returns {string}
 */
export const extractExcerpt = (markdown, maxLength = 200) => {
	if (!markdown) return '';

	// Remove headers
	const withoutHeaders = markdown.replace(/^#{1,6}\s+.+$/gm, '');

	// Get first paragraph
	const paragraphs = withoutHeaders
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean);

	if (paragraphs.length === 0) return '';

	const firstPara = markdownToText(paragraphs[0]);

	if (firstPara.length <= maxLength) return firstPara;
	return firstPara.slice(0, maxLength).trim() + '...';
};

/**
 * Count words in markdown (excluding formatting)
 * @param {string} markdown - Markdown text
 * @returns {number}
 */
export const countMarkdownWords = (markdown) => {
	const plainText = markdownToText(markdown);
	if (!plainText) return 0;
	return plainText.trim().split(/\s+/).length;
};

/**
 * Parse markdown frontmatter (YAML at start of document)
 * @param {string} markdown - Markdown with frontmatter
 * @returns {{frontmatter: Object, content: string}}
 */
export const parseFrontmatter = (markdown) => {
	if (!markdown) return { frontmatter: {}, content: '' };

	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = markdown.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, content: markdown };
	}

	// Simple YAML parser (key: value pairs only)
	const frontmatterText = match[1];
	const frontmatter = {};

	frontmatterText.split('\n').forEach((line) => {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			const value = line.slice(colonIndex + 1).trim();
			frontmatter[key] = value;
		}
	});

	return {
		frontmatter,
		content: match[2],
	};
};

/**
 * Add IDs to headers in markdown (for anchor links)
 * @param {string} markdown - Original markdown
 * @returns {string} Markdown with header IDs
 */
export const addHeaderIds = (markdown) => {
	if (!markdown) return '';

	return markdown.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
		const id = generateId(text);
		return `${hashes} ${text} {#${id}}`;
	});
};
