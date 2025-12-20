/**
 * @typedef {Object} SearchResult
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {Object} attributes
 */

/**
 * @typedef {Object} SearchResultViewModel
 * @property {string} id
 * @property {string} name
 * @property {string} typeLabel
 * @property {string} description
 * @property {Object} icon - Lucide Icon Component
 * @property {Object} theme - Tailwind color classes
 */

/**
 * @typedef {Object} GlobalSearchViewModel
 * @property {boolean} isOpen
 * @property {function(boolean): void} setIsOpen
 * @property {string} query
 * @property {function(string): void} setQuery
 * @property {SearchResultViewModel[]} results
 * @property {boolean} isLoading
 * @property {SearchResultViewModel[]} recentSearches
 * @property {number} selectedIndex
 * @property {function(number): void} setSelectedIndex
 * @property {function(SearchResultViewModel): void} handleSelect
 * @property {function(): void} clearRecent
 */

export {};
