/**
 * @typedef {Object} EntityTheme
 * @property {string} text - Tailwind text color class
 * @property {string} bg - Tailwind bg color class
 * @property {string} border - Tailwind border color class
 * @property {string} hover - Tailwind hover class
 * @property {Object} Icon - Lucide React Component
 */

/**
 * @typedef {Object} EntityViewModel
 * @property {Object} header
 * @property {string} header.title
 * @property {string} header.typeLabel
 * @property {string} header.imageUrl
 * @property {Object} header.status - { label: string, isDead: boolean, hasStatus: boolean }
 * @property {EntityTheme} header.theme
 *
 * @property {Object} sidebar
 * @property {Array<{key: string, value: string}>} sidebar.traits
 * @property {Array<{id: string, name: string, typeLabel: string, role: string, theme: EntityTheme}>} sidebar.connections
 *
 * @property {Object} content
 * @property {string|null} content.summary
 * @property {Array<{key: string, value: string}>} content.sections
 * @property {Array<{id: string, title: string, description: string}>} content.history
 */

export {}; // Makes this a module
