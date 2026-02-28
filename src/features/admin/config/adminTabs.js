import { FileText, Calendar, Target, BookOpen, Swords, LinkIcon, Map, Scan } from 'lucide-react';

/**
 * Defines which tabs are available per entity type.
 * Every type gets 'details'. Additional tabs are type-specific.
 * Tabs with `requiresId: true` only show when editing an existing entity.
 */

const DETAILS_TAB = { id: 'details', label: 'Details', icon: FileText };
const RELATIONSHIPS_TAB = { id: 'relationships', label: 'Links', icon: LinkIcon, requiresId: true };

const TYPE_TABS = {
	session: [
		DETAILS_TAB,
		{ id: 'events', label: 'Events', icon: Calendar, requiresId: true },
		{ id: 'scanner', label: 'Scanner', icon: Scan, requiresId: true },
		RELATIONSHIPS_TAB,
	],
	quest: [
		DETAILS_TAB,
		{ id: 'objectives', label: 'Objectives', icon: Target, requiresId: true },
		RELATIONSHIPS_TAB,
	],
	encounter: [
		DETAILS_TAB,
		{ id: 'narrative', label: 'Narrative', icon: BookOpen, requiresId: true },
		{ id: 'combat', label: 'Combat Log', icon: Swords, requiresId: true },
		RELATIONSHIPS_TAB,
	],
};

// Default tabs for any type not explicitly configured
const DEFAULT_TABS = [DETAILS_TAB, RELATIONSHIPS_TAB];

/**
 * Returns the tab definitions for a given entity type, filtered by context.
 * @param {string} type - Entity type
 * @param {string|null} id - Entity ID (null for create mode)
 * @returns {Array} Filtered tab definitions
 */
export function getTabsForType(type, id) {
	const tabs = TYPE_TABS[type] || DEFAULT_TABS;
	return tabs.filter((tab) => !tab.requiresId || !!id);
}
