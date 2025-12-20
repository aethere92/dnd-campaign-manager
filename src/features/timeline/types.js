/**
 * @typedef {Object} EventStyle
 * @property {Object} Icon - Lucide React Component
 * @property {string} container - Tailwind classes for the bubble (bg, border, text)
 * @property {string} line - Tailwind classes for the connector line
 */

/**
 * @typedef {Object} TimelineEventModel
 * @property {string} id
 * @property {string} title
 * @property {string} typeLabel
 * @property {string} description
 * @property {Object|null} location - { name: string }
 * @property {Object|null} npc - { name: string }
 * @property {EventStyle} style
 */

/**
 * @typedef {Object} TimelineSessionModel
 * @property {string} id
 * @property {number} number
 * @property {string} dateLabel
 * @property {string} title
 * @property {TimelineEventModel[]} events
 */

export {};
