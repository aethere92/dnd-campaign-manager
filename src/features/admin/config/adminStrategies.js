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
			{ key: 'icon', label: 'Icon URL', type: 'image' },
			{ key: 'background_image', label: 'Background Image', type: 'image' },
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
			{ key: 'background_image', label: 'Background Image', type: 'image' },
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
			{ key: 'map_image', label: 'Map Image', type: 'image' },
		],
	},

	// 3. SESSION
	session: {
		label: 'Chronicles',
		type: 'session',
		primaryTable: 'sessions',
		colMapping: { name: 'title', description: 'narrative' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'session_number', label: 'Session Number', type: 'number' },
			{ key: 'session_date', label: 'In-Game Date', type: 'text' },
			{ key: 'background_image', label: 'Background Image', type: 'image' },
			{ key: 'map_image', label: 'Map Image', type: 'image' },
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
			{ key: 'background_image', label: 'Background Image', type: 'image' },
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
			{ key: 'background_image', label: 'Background Image', type: 'image' },
		],
	},

	// 6. ITEM
	item: {
		label: 'Item',
		type: 'item',
		primaryTable: 'items',
		colMapping: { name: 'name', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{
				key: 'type',
				label: 'Type',
				type: 'select',
				options: ['Weapon', 'Armor', 'Potion', 'Scroll', 'Wondrous Weapon', 'Wondrous Armor', 'Key Item', 'Treasure'],
			},
			{
				key: 'rarity',
				label: 'Rarity',
				type: 'select',
				options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'],
			},
			{ key: 'attunement', label: 'Attunement?', type: 'select', options: ['Yes', 'No'] },
			{ key: 'icon', label: 'Icon URL', type: 'image' },
			{ key: 'background_image', label: 'Background Image', type: 'image' },
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
			{ key: 'background_image', label: 'Background Image', type: 'image' },
		],
	},

	// 8. ENCOUNTER
	encounter: {
		label: 'Encounter',
		type: 'encounter',
		primaryTable: 'encounters',
		colMapping: { name: 'name', description: 'description', timeline: 'timeline' },
		hasNarrative: true,
		defaultAttributes: [
			{
				key: 'timeline_mode',
				label: 'Public Display Mode',
				type: 'select',
				options: ['Legacy Combat Log', 'Narrative Timeline'],
			},
			{
				key: 'status',
				label: 'Status',
				type: 'select',
				options: ['Planned', 'In Progress', 'Completed', 'Skipped'],
			},
			{ key: 'background_image', label: 'Background Image', type: 'image' },
			{ key: 'map_image', label: 'Map Image', type: 'image' },
		],
	},

	// 9. Narrative Arc

	narrative_arc: {
		label: 'Narrative Arc',
		type: 'narrative_arc',
		primaryTable: 'narrative_arcs',
		colMapping: { name: 'title', description: 'description' },
		hasNarrative: true,
		defaultAttributes: [
			{ key: 'order', label: 'Sort Order', type: 'number' },
			{ key: 'type', label: 'Arc Type', type: 'select', options: ['Primary', 'Secondary', 'Character Arc'] },
			{ key: 'background_image', label: 'Cover Image', type: 'image' },
		],
	},

	// 10. ATLAS MAP
	map: {
		label: 'Atlas Map',
		type: 'map',
		primaryTable: 'maps',
		colMapping: { name: 'title', description: null }, // Maps Title to DB Title, ignores description
		jsonField: 'config', // Tells service this is the JSON column, not 'attributes'
		hasNarrative: false,
		defaultAttributes: [
			{ key: 'key', label: 'Map Key (Unique ID)', type: 'text', required: true },
			{
				key: 'parentId',
				label: 'Parent Map Key',
				type: 'text',
				suggestions: 'map_keys', // Custom flag we'll use in the Form
			},
			{ key: 'path', label: 'Storage Path / URL', type: 'storage_path', placeholder: 'https://.../folder_name' },
			{ key: 'fileExtension', label: 'Extension', type: 'text', defaultValue: 'webp' },
			{ key: 'imageWidth', label: 'Width (px)', type: 'number' },
			{ key: 'imageHeight', label: 'Height (px)', type: 'number' },
			{ key: 'maxZoom', label: 'Max Zoom', type: 'number', defaultValue: 4 },
		],
	},

	default: {
		label: 'Entity',
		primaryTable: 'entities',
		colMapping: { name: 'name', description: 'description' },
		defaultAttributes: [
			{ key: 'type', label: 'Type', type: 'text' },
			{ key: 'map_image', label: 'Tactical Map Image', type: 'image' }, // Added this
			{ key: 'background_image', label: 'Header Background', type: 'image' },
		],
	},
};

export const getStrategy = (type) => {
	return ADMIN_STRATEGIES[type] || ADMIN_STRATEGIES.default;
};
