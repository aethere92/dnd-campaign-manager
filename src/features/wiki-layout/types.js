/**
 * @typedef {Object} WikiConfig
 * @property {string} label - Pluralized label (e.g., "Characters")
 * @property {Object} Icon - Lucide React Icon
 * @property {string} textClass - Tailwind text color class
 */

/**
 * @typedef {Object} WikiNavItem
 * @property {string} id
 * @property {string} name
 * @property {string} path - The relative path for the link
 */

/**
 * @typedef {Object} WikiNavigationModel
 * @property {WikiConfig} config
 * @property {boolean} isLoading
 * @property {boolean} hasItems - True if any items exist (ignoring filter)
 * @property {WikiNavItem[]} items - The filtered list to display
 * @property {string} search - Current search term
 * @property {function(string): void} setSearch - Search setter
 */

export {};
