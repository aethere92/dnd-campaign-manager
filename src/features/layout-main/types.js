/**
 * @typedef {Object} NavItemConfig
 * @property {string} label
 * @property {Object} Icon - Lucide React Icon
 * @property {string} path
 */

/**
 * @typedef {Object} NavGroupConfig
 * @property {string} title
 * @property {NavItemConfig[]} items
 */

/**
 * @typedef {Object} LayoutViewModel
 * @property {boolean} sidebarOpen
 * @property {function(boolean): void} setSidebarOpen
 * @property {string} currentPath
 * @property {function(string): void} navigateTo
 * @property {Object|null} campaign - { name: string, initial: string }
 * @property {function(): void} onSwitchCampaign
 * @property {NavGroupConfig[]} navStructure
 */

export {};
