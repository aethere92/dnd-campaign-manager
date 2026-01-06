// Defines WHICH data fields to show for each entity type.
// Visuals (Icons, Colors) are handled by the centralized EntityConfig.

export const TOOLTIP_PROFILES = {
	// --- CHARACTERS ---
	character: {
		subtitle: ['level_prefix', 'race', 'class'],
		tags: ['status'],
		features: { showHP: true, showArmorClass: true, showMovement: true },
	},

	// --- NPCs ---
	npc: {
		subtitle: ['gender', 'race', 'role'],
		tags: ['status', 'affinity'],
		features: { showPersonality: true },
	},

	// --- LOCATIONS ---
	location: {
		subtitle: ['type', 'parent_location'],
		tags: [],
		features: { showRuler: true },
	},

	// --- QUESTS ---
	quest: {
		subtitle: ['quest type'],
		tags: ['status', 'priority'],
		features: {},
	},

	// --- ENCOUNTERS ---
	encounter: {
		subtitle: ['status'],
		tags: [],
		features: {},
	},

	// --- FACTIONS ---
	faction: {
		subtitle: ['affinity'],
		tags: [],
		features: {},
	},

	// --- SESSIONS ---
	session: {
		subtitle: ['session_number_prefixed', 'session_date'],
		tags: [],
		features: {},
	},
};

export const DEFAULT_PROFILE = {
	subtitle: ['type'],
	tags: [],
	features: {},
};
