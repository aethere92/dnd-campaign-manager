/**
 * Text Processing Utilities
 * String manipulation, sanitization, and formatting
 */

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export const truncate = (text, maxLength = 100) => {
	if (!text || text.length <= maxLength) return text;
	return text.slice(0, maxLength).trim() + '...';
};

/**
 * Sanitize text for safe display
 * @param {string} text - Text to sanitize
 * @returns {string}
 */
export const sanitizeText = (text) => {
	if (!text) return '';
	return String(text).trim();
};

/**
 * Convert text to URL-safe slug
 * @param {string} text - Text to convert
 * @returns {string}
 */
export const slugify = (text) => {
	if (!text) return '';

	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start
		.replace(/-+$/, ''); // Trim - from end
};

/**
 * Generate a unique ID from text (for headings, anchors)
 * @param {string} text - Text to convert
 * @returns {string}
 */
export const generateId = (text) => {
	if (!text) return '';

	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-');
};

/**
 * Extract plain text from children (for React components)
 * @param {*} children - React children
 * @returns {string}
 */
export const extractText = (children) => {
	if (typeof children === 'string') return children;
	if (Array.isArray(children)) return children.map(extractText).join('');
	if (children?.props?.children) return extractText(children.props.children);
	return '';
};

/**
 * Capitalize first letter of string
 * @param {string} text - Text to capitalize
 * @returns {string}
 */
export const capitalize = (text) => {
	if (!text) return '';
	return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Convert snake_case or kebab-case to Title Case
 * @param {string} text - Text to convert
 * @returns {string}
 */
export const toTitleCase = (text) => {
	if (!text) return '';

	return text
		.replace(/[_-]/g, ' ')
		.split(' ')
		.map((word) => capitalize(word))
		.join(' ');
};

/**
 * Count words in text
 * @param {string} text - Text to count
 * @returns {number}
 */
export const wordCount = (text) => {
	if (!text) return 0;
	return text.trim().split(/\s+/).length;
};

/**
 * Estimate reading time in minutes
 * @param {string} text - Text to analyze
 * @param {number} wordsPerMinute - Reading speed (default 200)
 * @returns {number}
 */
export const estimateReadingTime = (text, wordsPerMinute = 200) => {
	const words = wordCount(text);
	return Math.ceil(words / wordsPerMinute);
};

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string}
 */
export const escapeRegex = (str) => {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Strip markdown formatting, returning plain text.
 *
 * Single implementation replacing three prior variants (textUtils.stripMarkdown,
 * wikiUtils' local copy, markdownUtils.markdownToText) that had drifted apart.
 * Two bugs from the wiki copy are fixed here:
 *   - `code` was deleted entirely instead of unwrapped (missing capture group)
 *   - snake_case words were mangled ("Snake_case" -> "Snakecase"), because the
 *     italic rule matched bare underscores mid-word
 *
 * @param {string} text - Markdown text
 * @param {Object} [options]
 * @param {boolean} [options.collapseWhitespace=false] - Flatten newlines to
 *   single spaces. Use for one-line contexts (card excerpts, tooltips).
 * @returns {string} Plain text
 */
export const stripMarkdown = (text, { collapseWhitespace = false } = {}) => {
	if (!text) return '';

	let out = text
		.replace(/^#{1,6}\s+/gm, '') // Headers
		.replace(/(\*\*|__)(.+?)\1/g, '$2') // Bold
		.replace(/\*(.+?)\*/g, '$1') // Italic (asterisk)
		.replace(/\b_(.+?)_\b/g, '$1') // Italic (underscore, word-bounded)
		.replace(/```[\s\S]*?```/g, '') // Fenced code blocks
		.replace(/`(.+?)`/g, '$1') // Inline code -> keep content
		.replace(/!\[.*?\]\(.*?\)/g, '') // Images
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links -> keep label
		.replace(/^>\s+/gm, '') // Blockquotes
		.replace(/^\s*[-*+]\s+/gm, '') // Unordered lists
		.replace(/^\s*\d+\.\s+/gm, ''); // Ordered lists

	if (collapseWhitespace) {
		out = out.replace(/\s+/g, ' ');
	}

	return out.trim();
};

/**
 * Check if text contains markdown formatting
 * @param {string} text - Text to check
 * @returns {boolean}
 */
export const hasMarkdown = (text) => {
	if (!text) return false;

	const markdownPatterns = [
		/#{1,6}\s+/, // Headers
		/\*\*.*?\*\*/, // Bold
		/\*.*?\*/, // Italic
		/\[.*?\]\(.*?\)/, // Links
		/`.*?`/, // Code
		/^>\s+/m, // Blockquotes
		/^[-*+]\s+/m, // Lists
		/^\d+\.\s+/m, // Ordered lists
	];

	return markdownPatterns.some((pattern) => pattern.test(text));
};

/**
 * Formats a YYYY-MM-DD string into a readable date (e.g., "Dec 06, 2025")
 */
export const formatDate = (dateString) => {
	if (!dateString) return '';
	const options = { year: 'numeric', month: 'short', day: '2-digit' };
	try {
		return new Date(dateString).toLocaleDateString('en-US', options);
	} catch (e) {
		return dateString;
	}
};
