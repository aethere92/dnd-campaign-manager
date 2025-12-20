/**
 * @typedef {Object} Campaign
 * @property {string} id
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {Object} CampaignSelectionViewModel
 * @property {boolean} isLoading
 * @property {Campaign[]} campaigns
 * @property {function(string): void} selectCampaign
 */

export {};
