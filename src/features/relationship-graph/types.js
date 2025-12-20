/**
 * @typedef {Object} GraphNodeData
 * @property {string} id
 * @property {string} label
 * @property {string} color - Hex color
 * @property {string} image - URL to icon/image
 * @property {string} type - Entity type
 */

/**
 * @typedef {Object} GraphEdgeData
 * @property {string} id
 * @property {string} source - Source Node ID
 * @property {string} target - Target Node ID
 * @property {string} label - Edge label (relationship type)
 * @property {string} color - Hex color
 */

/**
 * @typedef {Object} CytoscapeElement
 * @property {string} group - 'nodes' | 'edges'
 * @property {GraphNodeData | GraphEdgeData} data
 */

export {};
