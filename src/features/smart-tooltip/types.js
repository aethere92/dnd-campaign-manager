/**
 * @typedef {Object} TooltipPosition
 * @property {number} x - Client X coordinate
 * @property {number} y - Client Y coordinate
 */

/**
 * @typedef {Object} TooltipTarget
 * @property {string} id - Entity UUID
 * @property {string} type - Entity Type
 * @property {TooltipPosition} pos
 */

/**
 * @typedef {Object} TooltipContextValue
 * @property {function(React.MouseEvent, string, string): void} openTooltip
 * @property {function(): void} closeTooltip
 */

export {};
