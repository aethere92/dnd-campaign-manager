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
 * Strip markdown formatting (basic)
 * @param {string} text - Markdown text
 * @returns {string} Plain text
 */
export const stripMarkdown = (text) => {
	if (!text) return '';

	return text
		.replace(/#{1,6}\s+/g, '') // Headers
		.replace(/\*\*(.+?)\*\*/g, '$1') // Bold
		.replace(/\*(.+?)\*/g, '$1') // Italic
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
		.replace(/`(.+?)`/g, '$1') // Code
		.replace(/^>\s+/gm, '') // Blockquotes
		.trim();
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
