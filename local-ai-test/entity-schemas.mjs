/**
 * Per-type field definitions for entity DISCOVERY (pass A) and description
 * writing (pass B2). Mirrors adminStrategies.js so the import payload maps
 * straight onto what createEntity() expects.
 *
 * Only fields a model can reasonably infer from narrative prose are listed.
 * Images, map keys, numeric stat blocks etc. are excluded — those are yours.
 */

export const ENTITY_TYPES = ['npc', 'location', 'faction', 'quest', 'item', 'encounter'];

export const TYPE_SPECS = {
	npc: {
		table: 'npcs',
		hint: 'A named individual who is not a player character.',
		attributes: {
			race: 'species/ancestry if stated (e.g. human, hobgoblin, elf)',
			class: 'role, profession, or occupation (e.g. guard captain, innkeeper)',
			affinity: 'one of: Ally, Neutral, Enemy, Unknown — how they stand toward the party',
			status: 'alive, dead, missing, captured — only if the text says',
		},
		enums: { affinity: ['Ally', 'Neutral', 'Enemy', 'Unknown'] },
	},
	location: {
		table: 'locations',
		hint: 'A place: region, settlement, building, dungeon, landmark, wilderness.',
		attributes: {
			type: 'region, city, town, village, building, dungeon, cave, forest, landmark, ship, realm',
		},
		enums: {
			type: ['region', 'city', 'town', 'village', 'building', 'dungeon', 'cave', 'forest', 'landmark', 'ship', 'realm'],
		},
	},
	faction: {
		table: 'factions',
		hint: 'An organised group: guild, order, army, cult, noble house, tribe.',
		attributes: {
			leader: 'name of the leader if stated',
			affinity: 'one of: Ally, Neutral, Enemy, Unknown',
		},
		enums: { affinity: ['Ally', 'Neutral', 'Enemy', 'Unknown'] },
	},
	quest: {
		table: 'quests',
		hint: 'An objective or mission the party has taken on or been offered.',
		attributes: {
			status: 'active, completed, failed, pending',
			'quest type': 'Main Quest, Side Quest, Personal Quest',
			priority: 'critical, high, medium, low',
		},
		enums: {
			status: ['active', 'completed', 'failed', 'pending'],
			'quest type': ['Main Quest', 'Side Quest', 'Personal Quest'],
			priority: ['critical', 'high', 'medium', 'low'],
		},
	},
	item: {
		table: 'items',
		hint: 'A specific notable object — magic item, relic, key treasure. NOT ordinary gear.',
		attributes: {
			type: 'weapon, armor, wondrous item, potion, scroll, ring, trinket',
			rarity: 'common, uncommon, rare, very rare, legendary',
		},
		enums: { rarity: ['common', 'uncommon', 'rare', 'very rare', 'legendary'] },
	},
	encounter: {
		table: 'encounters',
		hint: 'A discrete combat or major set-piece confrontation.',
		attributes: { status: 'won, lost, fled, avoided, ongoing' },
		enums: { status: ['won', 'lost', 'fled', 'avoided', 'ongoing'] },
	},
};

/** Timeline event types — must match getEventStyle() in the app. */
export const EVENT_TYPES = [
	'combat',
	'social',
	'quest_started',
	'quest_progressed',
	'travel',
	'location_discovered',
	'location_visited',
	'npc_encountered',
	'faction_discovered',
	'investigation',
	'backstory',
	'discovery',
	'vision',
	'shopping',
	'special_event',
];

/**
 * JSON schema for pass A — entity discovery.
 *
 * Field names are deliberately self-describing. Run 1 used `name` and `type` with
 * only prose descriptions, and the model put the CATEGORY in both — every entity
 * came back named "npc" or "location". `proper_noun` cannot be confused with
 * `category` the way `name` can be confused with `type`.
 */
export function discoverySchema() {
	return {
		type: 'object',
		properties: {
			entities: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						// Evidence first: ground the name in the text before committing
						// to a category. Same lesson as pass C v2->v3.
						quote: {
							type: 'string',
							description: 'The exact sentence fragment from the narrative where this entity appears.',
						},
						proper_noun: {
							type: 'string',
							description:
								'The entity\'s actual NAME as written in the text, e.g. "Captain Soranna", "Drellin\'s Ferry", "Vraath Keep". Never a category word like "npc" or "location".',
						},
						category: {
							type: 'string',
							enum: ENTITY_TYPES,
							description: 'Which kind of thing the named entity is.',
						},
						aliases: {
							type: 'array',
							items: { type: 'string' },
							description: 'Other names used for this SAME entity in this text. Empty array if none.',
						},
					},
					required: ['quote', 'proper_noun', 'category', 'aliases'],
				},
			},
		},
		required: ['entities'],
	};
}

/**
 * JSON schema for pass B2/B3 — description + attributes for ONE entity.
 *
 * `facts_about_entity` comes first and is required. Run 1 produced whole-session
 * summaries for every entity because the model was handed the full narrative and
 * asked to "describe X" with nothing forcing it to isolate X. Making it list the
 * relevant facts first constrains what the description can then contain.
 */
export function describeSchema(type, entityName) {
	const spec = TYPE_SPECS[type];
	const props = {
		facts_about_entity: {
			type: 'array',
			items: { type: 'string' },
			description: `Each fact the narrative states specifically about ${entityName}. Not events ${entityName} merely witnessed. Empty array if the text says nothing about them.`,
		},
		description: {
			type: 'string',
			description: `2-3 sentences about ${entityName} ONLY, built from facts_about_entity. Do not summarise the session. Do not mention other characters' actions unless ${entityName} was involved.`,
		},
		attributes: { type: 'object', properties: {}, required: [] },
	};
	for (const [key] of Object.entries(spec.attributes || {})) {
		props.attributes.properties[key] = spec.enums?.[key]
			? { type: 'string', enum: [...spec.enums[key], 'UNKNOWN'] }
			: { type: 'string' };
	}
	return {
		type: 'object',
		properties: props,
		required: ['facts_about_entity', 'description', 'attributes'],
	};
}

/** JSON schema for pass D — timeline events. */
export function eventsSchema() {
	return {
		type: 'object',
		properties: {
			events: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						title: { type: 'string' },
						description: { type: 'string' },
						event_type: { type: 'string', enum: EVENT_TYPES },
						entities_involved: { type: 'array', items: { type: 'string' } },
					},
					required: ['title', 'description', 'event_type', 'entities_involved'],
				},
			},
		},
		required: ['events'],
	};
}
