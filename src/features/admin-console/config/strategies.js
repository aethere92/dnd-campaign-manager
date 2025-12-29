export const ADMIN_STRATEGIES = {
	// 0. CAMPAIGN (Meta Entity)
	campaign: {
		label: 'Campaign',
		type: 'campaign',
		primaryTable: 'campaigns',
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true, // Use Markdown for description
		defaultAttributes: [
			{ key: 'campaign_id', label: 'Campaign ID (Integer)', type: 'number' }, // Required by your schema
			{ key: 'map_data', label: 'Map Data (JSON)', type: 'text' }, // Advanced: map config
		],
	},

	// 1. NPC
	npc: {
		label: 'NPC',
		type: 'npc',
		primaryTable: 'npcs',
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'race', label: 'Race/Ancestry', type: 'text' },
			{ key: 'class', label: 'Class/Occupation', type: 'text' },
			{ key: 'affinity', label: 'Affinity', type: 'select', options: ['Ally', 'Neutral', 'Enemy', 'Unknown'] },
			{ key: 'status', label: 'Status', type: 'text' },
			{ key: 'icon', label: 'Icon URL', type: 'image' },
		],
	},

	// 2. LOCATION
	location: {
		label: 'Location',
		type: 'location',
		primaryTable: 'locations',
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'type', label: 'Type', type: 'text' },
			{ key: 'background_image', label: 'Background Image', type: 'image' },
		],
	},

	// 3. SESSION
	session: {
		label: 'Session',
		type: 'session',
		primaryTable: 'sessions',
		colMapping: { name: 'title', description: 'narrative' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'session_number', label: 'Session Number', type: 'number' },
			{ key: 'session_date', label: 'In-Game Date', type: 'text' },
		],
	},

	// 4. QUEST
	quest: {
		label: 'Quest',
		type: 'quest',
		primaryTable: 'quests',
		colMapping: { name: 'title', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'Failed', 'Pending'] },
			{
				key: 'quest type',
				label: 'Quest Type',
				type: 'select',
				options: ['Main Quest', 'Side Quest', 'Personal Quest'],
			},
			{ key: 'priority', label: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low', 'Trivial'] },
		],
	},

	// 5. FACTION
	faction: {
		label: 'Faction',
		type: 'faction',
		primaryTable: 'factions',
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'leader', label: 'Leader', type: 'text' },
			{ key: 'affinity', label: 'Affinity', type: 'select', options: ['Ally', 'Neutral', 'Enemy'] },
			{ key: 'icon', label: 'Icon URL', type: 'image' },
		],
	},

	// 6. ITEM
	item: {
		label: 'Item',
		type: 'item',
		primaryTable: 'items',
		colMapping: { name: 'name', description: 'description' },
		defaultAttributes: [
			{
				key: 'type',
				label: 'Type',
				type: 'select',
				options: ['Weapon', 'Armor', 'Potion', 'Scroll', 'Wondrous Item', 'Key Item', 'Treasure'],
			},
			{
				key: 'rarity',
				label: 'Rarity',
				type: 'select',
				options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'],
			},
			{ key: 'value', label: 'Gold Value', type: 'text' },
			{ key: 'attunement', label: 'Attunement?', type: 'select', options: ['Yes', 'No'] },
			{ key: 'icon', label: 'Icon URL', type: 'image' },
		],
	},

	// 7. CHARACTER (The Party)
	character: {
		label: 'Character',
		type: 'character',
		primaryTable: 'characters',
		// 'background' is usually the column name for description in D&D schemas
		// If your table uses 'description', change 'background' to 'description'
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'race', label: 'Race', type: 'text' },
			{ key: 'class', label: 'Class', type: 'text' },
			{ key: 'level', label: 'Level', type: 'number' },
			{ key: 'speed', label: 'Speed', type: 'text' },
			{ key: 'hit points', label: 'Hit Points', type: 'text' },
			{ key: 'armor class', label: 'Armor Class', type: 'text' },
			{ key: 'icon', label: 'Icon URL', type: 'image' },
		],
	},

	// 8. ENCOUNTER
	encounter: {
		label: 'Encounter',
		type: 'encounter',
		primaryTable: 'encounters',
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{
				key: 'status',
				label: 'Status',
				type: 'select',
				options: ['Planned', 'In Progress', 'Completed', 'Skipped'],
			},
		],
	},

	default: {
		label: 'Entity',
		primaryTable: 'entities',
		colMapping: { name: 'name', description: 'description' },
		defaultAttributes: [],
	},
};

export const getStrategy = (type) => {
	return ADMIN_STRATEGIES[type] || ADMIN_STRATEGIES.default;
};
