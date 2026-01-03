// ==========================================
// ALIASES
// ==========================================
export const CAMPAIGN_01_ALIASES = {
	world_map: 'world_maps',
	unnamed_island_01: 'world_maps.submaps.islands.unnamed_island_01',
	finneas_encounter: 'world_maps.submaps.islands.unnamed_island_01.submaps.encounters.finneas_encounter',
	bone_wraiths_01: 'world_maps.submaps.combat_encounters.bone_wraiths_encounter_01',
	korinis_island: 'world_maps.submaps.islands.korinis_island',
	korinis_pyramid:
		'world_maps.submaps.islands.korinis_island.submaps.interiors.korinis_island_interior_water_mages_pyramid',
	korinis_teleporter_c:
		'world_maps.submaps.islands.korinis_island.submaps.interiors.korinis_island_interior_pyramid_teleporter_c',
	korinis_bandits_01:
		'world_maps.submaps.islands.korinis_island.submaps.encounters.korinis_island_encounters_bandits_01',
	korinis_spider_cave: 'world_maps.submaps.islands.korinis_island.submaps.encounters.korinis_island_spider_cave',
	final_location: 'world_maps.submaps.islands.final_location',
};

// ==========================================
// EXTRACTED DATA
// ==========================================

// --- World Map Paths ---
const WORLD_MAP_PATHS = [
	{
		name: 'The Story So Far',
		lineColor: '#FFDD00',
		points: [
			{
				coordinates: [-159.375, 206.34375],
				text: 'This is where the adventure began.',
			},
			{
				coordinates: [-160.15625, 204.90625],
			},
			{
				coordinates: [-161.625, 201.28125],
			},
			{
				coordinates: [-161.75, 197.875],
			},
			{
				coordinates: [-161.5625, 194.90625],
			},
			{
				coordinates: [-161.90625, 191.96875],
			},
			{
				coordinates: [-162.46875, 188.15625],
			},
			{
				coordinates: [-163.0625, 185.4375],
			},
			{
				coordinates: [-164.96875, 182.09375],
			},
			{
				coordinates: [-167.9375, 179.28125],
			},
			{
				coordinates: [-171.78125, 178.25],
			},
			{
				coordinates: [-178, 177.1875],
			},
			{
				coordinates: [-180.625, 176.46875],
			},
			{
				coordinates: [-182.6875, 174.5625],
			},
			{
				coordinates: [-185.53125, 170.1875],
			},
			{
				coordinates: [-187.3125, 166.03125],
			},
			{
				coordinates: [-188.46875, 160.90625],
			},
			{
				coordinates: [-190.09375, 156.125],
			},
			{
				coordinates: [-191.34375, 154.25],
			},
			{
				coordinates: [-194.28125, 153.1875],
			},
			{
				coordinates: [-197.15625, 153.34375],
			},
			{
				coordinates: [-199.84375, 155.6875],
			},
			{
				coordinates: [-201.53125, 158.84375],
			},
			{
				coordinates: [-200.90625, 161.34375],
			},
			{
				coordinates: [-199.9375, 163.15625],
			},
			{
				coordinates: [-197.96875, 165.125],
				text: 'Reaching an unnamed island, they stopped by to get water. Here they met Finneas, entered a temple and barely escaped a horde of undead.',
			},
			{
				coordinates: [-200.5625, 165.34375],
			},
			{
				coordinates: [-202.34375, 164.59375],
			},
			{
				coordinates: [-204.03125, 160.96875],
			},
			{
				coordinates: [-204.84375, 156.34375],
			},
			{
				coordinates: [-204.875, 150.71875],
			},
			{
				coordinates: [-203.5, 144.3125],
			},
			{
				coordinates: [-201.53125, 139.28125],
			},
			{
				coordinates: [-201.40625, 133.5],
			},
			{
				coordinates: [-201.75, 130.125],
			},
			{
				coordinates: [-204.84375, 126.09375],
			},
			{
				coordinates: [-206.40625, 122.8125],
			},
			{
				coordinates: [-206.71875, 118.59375],
			},
			{
				coordinates: [-209.59375, 116.9375],
				text: 'The bone the Barbarian had picked up was cursed. The party was attacked by wraiths summoned by the bone and barely managed to escape.',
			},
			{
				coordinates: [-207.78125, 113.78125],
			},
			{
				coordinates: [-207.375, 111.21875],
			},
			{
				coordinates: [-208.8125, 108.90625],
			},
			{
				coordinates: [-208.78125, 104.3125],
			},
			{
				coordinates: [-208.03125, 99.96875],
			},
			{
				coordinates: [-206.84375, 96.0625],
			},
			{
				coordinates: [-207.15625, 93.78125],
			},
			{
				coordinates: [-208.90625, 91.34375],
			},
			{
				coordinates: [-214.84375, 89.21875],
			},
			{
				coordinates: [-219.78125, 85.03125],
			},
			{
				coordinates: [-221.875, 81.28125],
			},
			{
				coordinates: [-222.28125, 76.4375],
			},
			{
				coordinates: [-221.03125, 72.9375],
			},
			{
				coordinates: [-219.15625, 72.125],
			},
			{
				coordinates: [-217.46875, 72.8125],
			},
			{
				coordinates: [-214.8125, 74.78125],
			},
			{
				coordinates: [-214.5, 74.90625],
				text: 'They reached the isle of Korinis, where their adventure is still ongoing.',
			},
		],
	},
];

// --- Submap: Korinis Island ---
const KORINIS_ISLAND = {
	metadata: {
		path: 'maps/world_maps/korinis_island',
		mapId: 'korinis_island',
		sizes: {
			maxZoom: 5,
			imageWidth: 32069,
			imageHeight: 19161,
		},
	},
	annotations: {
		npcs: {
			name: 'NPCs',
			items: [
				{
					label: 'Darren (Fire mage)',
					lat: -127.25,
					lng: 511.125,
					type: 'people',
				},
				{
					label: 'Valros (Water mage)',
					lat: -166.03125,
					lng: 442.5,
					type: 'people',
				},
				{
					label: 'Erol (tablets)',
					lat: -165.25,
					lng: 621,
					type: 'place',
				},
				{
					label: 'Isgaroth (Fire mage)',
					lat: -98.5,
					lng: 652.1875,
					type: 'people',
				},
				{
					label: 'Thorben (Carpenter)',
					lat: -162.5625,
					lng: 425.1875,
					type: 'people',
				},
				{
					label: 'Constantine (Alchemist)',
					lat: -155.3125,
					lng: 428.03125,
					type: 'people',
				},
				{
					label: 'Thorek (Blacksmith)',
					lat: -124.21875,
					lng: 453.125,
					type: 'people',
				},
				{
					label: 'Lizardman',
					lat: -98.25,
					lng: 316.34375,
					type: 'people',
				},
				{
					label: 'Bridge Troll',
					lat: -75.9375,
					lng: 604.0625,
					type: 'people',
				},
				{
					label: 'Farm Blacksmith',
					lat: -57.5,
					lng: 911.96875,
					type: 'people',
				},
				{
					label: 'General Lee',
					lat: -63.625,
					lng: 888.75,
					type: 'people',
				},
				{
					label: 'Quixie & The Other Merchant',
					lat: -82.9375,
					lng: 893.375,
					type: 'people',
				},
				{
					label: 'Silvestro',
					lat: -88.625,
					lng: 897.375,
					type: 'people',
				},
				{
					label: 'Mercenary Guards',
					lat: -159.75,
					lng: 804.8125,
					type: 'people',
				},
				{
					label: 'Penal Colony Paladin Guards',
					lat: -356.875,
					lng: 698.75,
					type: 'people',
				},
				{
					label: 'Quickse and Zero',
					lat: -423.25,
					lng: 590.25,
					type: 'people',
				},
				{
					label: 'Salamander',
					lat: -206.25,
					lng: 401.8125,
					type: 'people',
				},
			],
		},
		points_of_interest: {
			name: 'Points of interest',
			items: [
				{
					label: 'Landing zone',
					lat: -274.375,
					lng: 137.375,
					type: 'place',
				},
				{
					label: 'World Map',
					lat: -277,
					lng: 412,
					type: 'text',
					fontSize: 20,
					mapLink: 'world_maps',
				},
				{
					label: 'Lower City Inn',
					lat: -148,
					lng: 497.5,
					type: 'place',
				},
				{
					label: 'Inn',
					lat: -173.3125,
					lng: 676.1875,
					type: 'place',
				},
				{
					label: 'Harbour Inn',
					lat: -96.25,
					lng: 416.5625,
					type: 'place',
				},
				{
					label: 'Paladin Barracks',
					lat: -116.5,
					lng: 502.75,
					type: 'place',
				},
				{
					label: 'Paladin Hall',
					lat: -220.5,
					lng: 389.375,
					type: 'place',
				},
				{
					label: 'Fire Mages Monastery',
					lat: -57.5,
					lng: 670.3125,
					type: 'place',
				},
				{
					label: 'Pawn shop',
					lat: -120.1875,
					lng: 390.6875,
					type: 'place',
				},
				{
					label: 'Secob Farm',
					lat: -138.34375,
					lng: 565.78125,
					type: 'place',
				},
				{
					label: 'Lobart Farm',
					lat: -145.375,
					lng: 283.15625,
					type: 'place',
					description:
						"The adventurers arrived at a farm on the outskirts of the city, seeking entry but lacking the necessary gold. Speaking with one of the farmers, they learned that the head farmer might offer them a way in. They approached him and were given a proposition: earn gold by helping with the crops and assisting the farmer's wife with her tasks.",
				},
				{
					label: 'Unnamed farm',
					lat: -290.75,
					lng: 713.375,
					type: 'people',
				},
				{
					label: 'Caves (scales + blue blood)',
					lat: -217.25,
					lng: 585.5625,
					type: 'place',
				},
				{
					label: 'Paladin ship',
					lat: -41,
					lng: 378,
					type: 'place',
				},
				{
					label: 'Teleporter Exit B',
					lat: -110.6875,
					lng: 558.0625,
					type: 'place',
				},
				{
					label: 'Teleporter Exit C',
					lat: -198.3125,
					lng: 655.8125,
					type: 'place',
					mapLink: 'korinis_teleporter_c',
				},
				{
					label: 'Water Mages Pyramid',
					lat: -40.125,
					lng: 580.125,
					type: 'place',
					mapLink: 'korinis_pyramid',
				},
				{
					label: "Erol's house",
					lat: -179.9375,
					lng: 803.5625,
					type: 'people',
				},
				{
					label: 'Farm Chapel',
					lat: -88.5625,
					lng: 858.34375,
					type: 'people',
				},
				{
					label: 'The Chocolate Contest Tavern',
					lat: -77.6875,
					lng: 863.5625,
					type: 'people',
				},
				{
					label: 'Tower',
					lat: -41.25,
					lng: 927.15625,
					type: 'people',
				},
				{
					label: 'Cave shortcut entrance',
					lat: -384.9375,
					lng: 708,
					type: 'people',
					mapLink: 'korinis_spider_cave',
				},
				{
					label: 'Cave shortcut exit',
					lat: -392.5,
					lng: 714.6875,
					type: 'people',
					mapLink: 'korinis_spider_cave',
				},
				{
					label: 'Mine entrance',
					lat: -391.625,
					lng: 686.1875,
					type: 'people',
				},
				{
					label: 'Mine shortcut exit',
					lat: -418.3125,
					lng: 646.9375,
					type: 'people',
				},
				{
					label: "Diego's hideout",
					lat: -414.125,
					lng: 531.375,
					type: 'people',
				},
				{
					label: 'Paladin Citadel Barracks',
					lat: -522.6875,
					lng: 511.8125,
					type: 'place',
				},
				{
					label: 'Fire Mages Chapel',
					lat: -534.78125,
					lng: 533.5625,
					type: 'place',
				},
				{
					label: 'Lizardmen Harbour',
					lat: -327.125,
					lng: 519.625,
					type: 'place',
				},
				{
					label: 'Penal Colony Ore Encounter',
					lat: -436.25,
					lng: 453.125,
					type: 'place',
				},
			],
		},
		combat_encounters: {
			name: 'Combat encounters',
			items: [
				{
					label: 'Wolves',
					lat: -111.25,
					lng: 349.25,
					type: 'place',
				},
				{
					label: 'Wolves',
					lat: -200.1875,
					lng: 564.34375,
					type: 'place',
				},
				{
					label: 'Bandits',
					lat: -94.1875,
					lng: 361.90625,
					type: 'people',
					mapLink: 'korinis_bandits_01',
				},
				{
					label: 'Bandits',
					lat: -125.9375,
					lng: 605.5625,
					type: 'people',
				},
				{
					label: 'Goblin camp',
					lat: -114.0625,
					lng: 332.59375,
					type: 'place',
					description:
						'The adventurers, hoping to make a new ally, approached the lizardman with friendly intentions. However, their efforts were met with hostility as the lizardman attacked them. The battle was intense, with the group struggling to subdue their reptilian foe. Just as they seemed to gain the upper hand, a group of goblins ambushed them from the shadows. The adventurers fought valiantly, managing to defeat the goblins, but in the chaos, one of the goblins used a spell to explode nearby corpses, which killed the lizardman, whom they had been trying to keep alive.',
				},
				{
					label: 'Inactive Golem',
					lat: -89.0625,
					lng: 614.3125,
					type: 'place',
				},
				{
					label: 'Snapers',
					lat: -46.9375,
					lng: 594.1875,
					type: 'place',
				},
				{
					label: 'Wasps',
					lat: -32.75,
					lng: 609.9375,
					type: 'place',
				},
				{
					label: 'Ruined Tower Seekers',
					lat: -238.9375,
					lng: 683.5625,
					type: 'people',
				},
				{
					label: "Bandits' cave",
					lat: -193.625,
					lng: 200.625,
					type: 'place',
				},
				{
					label: 'Cave spiders encounter',
					lat: -386.5,
					lng: 716,
					type: 'people',
				},
				{
					label: 'Dinosaurs combat ambush',
					lat: -445,
					lng: 584.125,
					type: 'people',
				},
				{
					label: 'Seekers ambush',
					lat: -428.6875,
					lng: 552.9375,
					type: 'place',
				},
			],
		},
		landmarks: {
			name: 'Landmarks',
			items: [
				{
					label: 'Main town of Korinis',
					lat: -142.0625,
					lng: 376.0625,
					type: 'landmark',
					description:
						"The main town of Korinis is a captivating town of contrasts. Nestled between the open waters and rugged hills, its bustling harbour is alive with the scent of saltwater and the sounds of merchants peddling their wares amidst poverty and resourcefulness. The lower city, a maze of alleys and market squares, thrives with commerce and crafts, shadowed by the vigilant paladins who ensure safety at the cost of freedom. The upper city, dominated by the paladins' formidable barracks, exudes grandeur and control, with wide streets and grand homes. In this town of Korinis, prosperity and poverty coexist, and every street tells a story.",
				},
				{
					label: 'Paladin Citadel',
					lat: -488.75,
					lng: 539.6875,
					type: 'landmark',
				},
				{
					label: 'General Lee Encampment',
					lat: -85.375,
					lng: 882.25,
					type: 'landmark',
				},
			],
		},
	},
	paths: [
		{
			name: '01. Session 1 Recap',
			lineColor: '#e2b203',
			sessionId: 2,
			points: [
				{
					coordinates: [-275.25, 138.375],
					text: 'Coming from the pirate ship, this is where the party landed on the Korinis Island.',
				},
				{
					coordinates: [-260.75, 144.0625],
				},
				{
					coordinates: [-248.6875, 147.5],
				},
				{
					coordinates: [-240.1875, 148],
					text: 'Seeing a path up the mountains, they decided to take it and go towards the mountains.',
				},
				{
					coordinates: [-229.0625, 147.125],
				},
				{
					coordinates: [-220.3125, 145.25],
				},
				{
					coordinates: [-207.625, 146],
				},
				{
					coordinates: [-197.375, 150],
				},
				{
					coordinates: [-192.0625, 153.625],
				},
				{
					coordinates: [-192.25, 161.1875],
					text: 'At the crossroads, they encountered a man who advised them to follow him into the caves, warning that some individuals were searching for them. After some debate, the party agreed to follow.',
				},
				{
					coordinates: [-193.3125, 173.5625],
				},
				{
					coordinates: [-193.9375, 188.9375],
				},
				{
					coordinates: [-193.9375, 199.3125],
					text: 'Turns out the people looking for them were bandits. Who could have guessed? After a fierce battle, the party emerged victorious.',
				},
				{
					coordinates: [-192.5, 196.625],
				},
				{
					coordinates: [-191.5625, 172.6875],
				},
				{
					coordinates: [-190.6875, 155.625],
					text: 'Back at the crossroads, they decided to go onwards to what they hoped would be a settlement.',
				},
				{
					coordinates: [-186.375, 153.8125],
				},
				{
					coordinates: [-172.8125, 152.125],
				},
				{
					coordinates: [-157.125, 151.1875],
				},
				{
					coordinates: [-142.5, 154.375],
				},
				{
					coordinates: [-132.875, 165.4375],
				},
				{
					coordinates: [-126.5625, 181.5625],
				},
				{
					coordinates: [-126.375, 198.9375],
				},
				{
					coordinates: [-131.0625, 213.6875],
				},
				{
					coordinates: [-134.375, 224.9375],
				},
				{
					coordinates: [-136.1875, 234.875],
					text: 'They saw a city in the background and a few farms to their right. Exhausted, they decided to go to one of the farmers.',
				},
				{
					coordinates: [-138.625, 247.75],
				},
				{
					coordinates: [-138.875, 262.1875],
				},
				{
					coordinates: [-138.8125, 276.25],
				},
				{
					coordinates: [-144.4375, 284.8125],
					text: "They arrived at Lobart's farm and spoke with its master, learning the cost of entry into the city. They were advised to perform deeds to earn money. They also spoke with the lead farmer's wife and received a task from her.",
				},
				{
					coordinates: [-139.1875, 288.1875],
				},
				{
					coordinates: [-139.6875, 309.9375],
				},
				{
					coordinates: [-139.8125, 330.125],
				},
				{
					coordinates: [-133.75, 335.3125],
					text: "Further down the road, they met a merchant who offered them entry to the city in exchange for a favor once inside. They also acquired a pan for the lead farmer's wife as part of her task.",
				},
				{
					coordinates: [-138.9375, 337.9375],
				},
				{
					coordinates: [-137.875, 342.5],
					text: "They returned to the farmer's wife and gave her the pan. In return, she provided them with food. Afterward, they spoke with the lead farmer again and spent the night in the barn.",
				},
				{
					coordinates: [-137.6875, 347.75],
				},
				{
					coordinates: [-140.25, 358.625],
				},
				{
					coordinates: [-143.25, 367.5625],
				},
				{
					coordinates: [-143.1875, 377.1875],
					text: 'They spoke with the guards and presented their entry pass, gaining access to the city.',
				},
				{
					coordinates: [-142.5625, 393.1875],
				},
				{
					coordinates: [-142.875, 406.625],
					text: 'They talked with the master paladin guarding the door, learning about the city rules and the locations of interest.',
				},
				{
					coordinates: [-146.875, 410.4375],
				},
				{
					coordinates: [-147.8125, 414.75],
				},
				{
					coordinates: [-145.5625, 417.5],
				},
				{
					coordinates: [-142.4375, 419.1875],
				},
				{
					coordinates: [-141.9375, 447.25],
				},
				{
					coordinates: [-141.625, 472.875],
				},
				{
					coordinates: [-141.3125, 489.0625],
				},
				{
					coordinates: [-146.0625, 489.6875],
				},
				{
					coordinates: [-146.25, 492.5],
				},
				{
					coordinates: [-147.4375, 494.625],
				},
				{
					coordinates: [-149.375, 496.8125],
					text: 'They entered the inn and slept. During the night, some of their gold and belongings were stolen.',
				},
			],
		},
		{
			name: '03. Session 3 Recap',
			lineColor: '#2898bd',
			sessionId: 3,
			points: [
				{
					coordinates: [-150.0625, 495.75],
					text: 'Woken up, the party decided to go into the woods and gather the plants that were requested by the alchemist.',
				},
				{
					coordinates: [-146.75, 493.5625],
				},
				{
					coordinates: [-146.375, 490.6875],
				},
				{
					coordinates: [-142.875, 489.625],
				},
				{
					coordinates: [-141.75, 503.875],
				},
				{
					coordinates: [-141.1875, 528.1875],
				},
				{
					coordinates: [-142.0625, 544.875],
					text: 'On the way out of the city, guards stopped them and asked them what they were doing. Upon learning they were headed into the forest, the guards wished them good luck.',
				},
				{
					coordinates: [-145.125, 548.375],
				},
				{
					coordinates: [-150.5, 549.1875],
				},
				{
					coordinates: [-156.0625, 549.6875],
				},
				{
					coordinates: [-159.8125, 551.6875],
				},
				{
					coordinates: [-161.625, 555.5625],
					text: 'The party ventured into the forest down this path.',
				},
				{
					coordinates: [-165.375, 555.8125],
				},
				{
					coordinates: [-168.9375, 554.8125],
				},
				{
					coordinates: [-170.9375, 559.4375],
				},
				{
					coordinates: [-174, 558.875],
				},
				{
					coordinates: [-175, 557.5625],
				},
				{
					coordinates: [-176.625, 560],
				},
				{
					coordinates: [-178, 561.625],
				},
				{
					coordinates: [-181.5, 561.3125],
				},
				{
					coordinates: [-184.625, 558.5625],
				},
				{
					coordinates: [-188.5625, 555.875],
				},
				{
					coordinates: [-190.875, 555.3125],
				},
				{
					coordinates: [-194.75, 558.875],
				},
				{
					coordinates: [-196.3125, 562.25],
				},
				{
					coordinates: [-201.4375, 564.1875],
					text: 'They attacked a pack of wolves which were roaming around in the forest. The battle was fierce, but they were victorious. They managed to find hides, which would prove useful to gain apprenticeship.',
				},
				{
					coordinates: [-204.6875, 564.75],
				},
				{
					coordinates: [-209.375, 566.1875],
				},
				{
					coordinates: [-213.3125, 570.875],
				},
				{
					coordinates: [-217.1875, 577.625],
				},
				{
					coordinates: [-217.6875, 584.375],
					text: 'Entering the nearby caves, they saw what looked like blue blood - lizardmen blood, and a few creatures which looked way too powerful for them to handle.',
				},
				{
					coordinates: [-213.1875, 585.125],
				},
				{
					coordinates: [-206.6875, 583.625],
				},
				{
					coordinates: [-202.5, 584.5],
				},
				{
					coordinates: [-196.8125, 582.5],
				},
				{
					coordinates: [-195.75, 573],
				},
				{
					coordinates: [-195.375, 564.3125],
				},
				{
					coordinates: [-192.0625, 557.875],
				},
				{
					coordinates: [-188.75, 557.75],
				},
				{
					coordinates: [-185.1875, 559.8125],
				},
				{
					coordinates: [-183.0625, 562.9375],
				},
				{
					coordinates: [-176.4375, 563.125],
				},
				{
					coordinates: [-171.1875, 561.6875],
				},
				{
					coordinates: [-168.75, 558.3125],
				},
				{
					coordinates: [-164.0625, 557.125],
				},
				{
					coordinates: [-161.8125, 558.125],
				},
				{
					coordinates: [-160.5, 583.5],
				},
				{
					coordinates: [-160.375, 593.4375],
				},
				{
					coordinates: [-160.25, 599.75],
				},
				{
					coordinates: [-160.1875, 612.3125],
				},
				{
					coordinates: [-160.0625, 616.5],
				},
				{
					coordinates: [-164.0625, 617.8125],
				},
				{
					coordinates: [-166.5625, 620.1875],
					text: 'Near the bridge, they met Erol, who had been robbed by the bandits on the bridge nearby. He had a broken leg, which the party Cleric mended.',
				},
				{
					coordinates: [-160.25, 619.5],
				},
				{
					coordinates: [-160.375, 641.5625],
				},
				{
					coordinates: [-159.8125, 663.25],
				},
				{
					coordinates: [-158.1875, 666.8125],
				},
				{
					coordinates: [-154.75, 668.6875],
				},
				{
					coordinates: [-153.125, 673.875],
				},
				{
					coordinates: [-141.5625, 673.75],
				},
				{
					coordinates: [-127.75, 672.9375],
				},
				{
					coordinates: [-116.9375, 672.75],
				},
				{
					coordinates: [-105.4375, 671.75],
				},
				{
					coordinates: [-100.6875, 671.125],
				},
				{
					coordinates: [-99.1875, 666.75],
				},
				{
					coordinates: [-98.4375, 658.875],
				},
				{
					coordinates: [-99.8125, 655.0625],
				},
				{
					coordinates: [-100, 650.5625],
					text: 'They saw Isgaroth, a Fire Mage, who was doing a prayer. They waited for two hours for the prayer to finish and after that they received the Fire Mage blessing for free, as they had made the trip to the Monastery.',
				},
				{
					coordinates: [-97.0625, 649.9375],
				},
				{
					coordinates: [-95.6875, 654.625],
				},
				{
					coordinates: [-96.5625, 665.25],
				},
				{
					coordinates: [-98.375, 668.25],
				},
				{
					coordinates: [-98.1875, 672.9375],
				},
				{
					coordinates: [-113.9375, 674.3125],
				},
				{
					coordinates: [-131.1875, 675.75],
				},
				{
					coordinates: [-148.375, 675.75],
				},
				{
					coordinates: [-153.6875, 676.4375],
				},
				{
					coordinates: [-158.125, 679.5],
				},
				{
					coordinates: [-163.25, 678.1875],
				},
				{
					coordinates: [-165.3125, 676.9375],
				},
				{
					coordinates: [-167.125, 677.875],
				},
				{
					coordinates: [-168.8125, 674.375],
				},
				{
					coordinates: [-173.8125, 674.9375],
					text: 'The party checked out the inn at the crossroads, looking for a place to spend the night in, but the prices were too steep for them, so they went back in town.',
				},
			],
		},
		{
			name: '04. Session 4 Recap',
			lineColor: '#ff7e55',
			sessionId: 4,
			points: [
				{
					coordinates: [-150.1875, 495.6875],
				},
				{
					coordinates: [-146.875, 494.375],
				},
				{
					coordinates: [-146.0625, 491],
				},
				{
					coordinates: [-143.75, 488.8125],
				},
				{
					coordinates: [-142.4375, 486.75],
				},
				{
					coordinates: [-141.6875, 477.5],
				},
				{
					coordinates: [-141.4375, 469.25],
					text: 'The party decided to venture outside, into the forest they saw when they first entered the city.',
				},
				{
					coordinates: [-141.375, 451.1875],
				},
				{
					coordinates: [-141.75, 426.4375],
				},
				{
					coordinates: [-141.125, 419],
				},
				{
					coordinates: [-138.3125, 417.125],
				},
				{
					coordinates: [-137.375, 412.5625],
				},
				{
					coordinates: [-139.5, 408.1875],
				},
				{
					coordinates: [-141.75, 405.0625],
				},
				{
					coordinates: [-141.3125, 383.8125],
				},
				{
					coordinates: [-141.4375, 371.25],
				},
				{
					coordinates: [-140.75, 364.5625],
				},
				{
					coordinates: [-139.25, 358.875],
				},
				{
					coordinates: [-135.6875, 359.0625],
				},
				{
					coordinates: [-130.875, 360.9375],
				},
				{
					coordinates: [-124.8125, 361.9375],
				},
				{
					coordinates: [-118.6875, 361.25],
				},
				{
					coordinates: [-113.125, 360.75],
					text: 'Seeing a pack of wolves and a goblin camp in the nearby forest, they took a more secluded path, going stealthily deeper in the forest.',
				},
				{
					coordinates: [-110.1875, 359.875],
				},
				{
					coordinates: [-105.625, 357.4375],
				},
				{
					coordinates: [-103.8125, 349.9375],
					text: 'In the distance stood a Lizardman. The party cleric decided to send a spell to them in order to make contact, hoping to come in peace and talk.',
				},
				{
					coordinates: [-104.375, 339.0625],
				},
				{
					coordinates: [-103.625, 333.25],
				},
				{
					coordinates: [-101.8125, 326.625],
					text: "The plan didn't work out. The lizardman attacked, enraged, and a battle started. In the midst of the battle, the goblin horde attacked as well, killing the downed Lizarman. The party emerged victorious.",
				},
				{
					coordinates: [-100.875, 322.5],
				},
				{
					coordinates: [-98.5625, 318.5],
				},
				{
					coordinates: [-94.4375, 317.875],
				},
				{
					coordinates: [-92.75, 321],
				},
				{
					coordinates: [-92.375, 329.8125],
				},
				{
					coordinates: [-92.75, 339.4375],
				},
				{
					coordinates: [-93.3125, 347.6875],
				},
				{
					coordinates: [-93.8125, 353.6875],
				},
				{
					coordinates: [-93.75, 357.375],
					text: 'The party was ambushed by some bandits who looked like they were smuggling things into the city. Overwhelmed and outnumbered, they wisely chose to run away from this encounter.',
				},
				{
					coordinates: [-91.9375, 351.625],
				},
				{
					coordinates: [-90.9375, 340.4375],
				},
				{
					coordinates: [-90.4375, 335.625],
				},
				{
					coordinates: [-90.4375, 327],
				},
				{
					coordinates: [-91.4375, 319.5625],
				},
				{
					coordinates: [-93.875, 316.0625],
				},
				{
					coordinates: [-100.375, 317.4375],
				},
				{
					coordinates: [-105.3125, 316.4375],
				},
				{
					coordinates: [-109.125, 315.9375],
				},
				{
					coordinates: [-114.125, 315.5625],
					text: 'Hoping to avoid the wildlife they had seen, they took another path through the forest.',
				},
				{
					coordinates: [-117.4375, 317.4375],
				},
				{
					coordinates: [-120.75, 322.0625],
				},
				{
					coordinates: [-127.3125, 333.25],
				},
				{
					coordinates: [-131.9375, 334.9375],
				},
				{
					coordinates: [-138.4375, 337.25],
				},
				{
					coordinates: [-137.9375, 345.0625],
				},
				{
					coordinates: [-138.8125, 353.1875],
				},
				{
					coordinates: [-143.3125, 367.75],
				},
				{
					coordinates: [-143.3125, 377.125],
				},
				{
					coordinates: [-143.4375, 389.25],
				},
				{
					coordinates: [-143.6875, 400.3125],
				},
				{
					coordinates: [-143.3125, 408.25],
					text: 'Back into the city, they stopped and talked to the Paladin guard and informed them of the bandits they had seen and their location.',
				},
				{
					coordinates: [-146.875, 410.3125],
				},
				{
					coordinates: [-148.125, 415.125],
				},
				{
					coordinates: [-143.375, 420.1875],
				},
				{
					coordinates: [-143.4375, 432.0625],
				},
				{
					coordinates: [-143, 452.5625],
				},
				{
					coordinates: [-142.9375, 470.125],
				},
				{
					coordinates: [-143.4375, 481.5],
				},
				{
					coordinates: [-143.5625, 485.3125],
				},
				{
					coordinates: [-144.625, 488.25],
				},
				{
					coordinates: [-150.25, 491.375],
				},
				{
					coordinates: [-150.625, 494.375],
					text: 'Exhausted for the day, they rested at the inn once more.',
				},
			],
		},
		{
			name: '07. Session 7 Recap',
			lineColor: '#84d8e3',
			sessionId: 5,
			points: [
				{
					coordinates: [-166.625, 440.6875],
				},
				{
					coordinates: [-163.4375, 440],
				},
				{
					coordinates: [-155.75, 438.375],
				},
				{
					coordinates: [-147.8125, 437.4375],
					text: 'The adventurers decide to journey to the pyramids in search of the water mages party.',
				},
				{
					coordinates: [-141.875, 437.75],
				},
				{
					coordinates: [-142, 447.375],
				},
				{
					coordinates: [-141.9375, 474.1875],
				},
				{
					coordinates: [-142, 495.625],
				},
				{
					coordinates: [-141.625, 517.6875],
				},
				{
					coordinates: [-141.375, 539],
				},
				{
					coordinates: [-141.1875, 545.3125],
				},
				{
					coordinates: [-143.625, 548.6875],
				},
				{
					coordinates: [-149.25, 549.5625],
				},
				{
					coordinates: [-155.5, 549.8125],
				},
				{
					coordinates: [-159.375, 552.875],
				},
				{
					coordinates: [-161.3125, 559.6875],
				},
				{
					coordinates: [-161.5625, 568.875],
				},
				{
					coordinates: [-161.1875, 573],
				},
				{
					coordinates: [-158.5625, 572.5625],
				},
				{
					coordinates: [-155.5, 573.25],
				},
				{
					coordinates: [-147.4375, 572.3125],
				},
				{
					coordinates: [-146.125, 572.25],
				},
				{
					coordinates: [-147, 569.125],
				},
				{
					coordinates: [-146.6875, 568.0625],
				},
				{
					coordinates: [-146.0625, 566.9375],
				},
				{
					coordinates: [-145, 566.5625],
				},
				{
					coordinates: [-142.3125, 566.5625],
				},
				{
					coordinates: [-140.8125, 565.75],
				},
				{
					coordinates: [-140, 564.6875],
				},
				{
					coordinates: [-136.75, 567.0625],
				},
				{
					coordinates: [-133.0625, 567.5],
				},
				{
					coordinates: [-123.1875, 574.4375],
				},
				{
					coordinates: [-119.3125, 578.3125],
				},
				{
					coordinates: [-117.3125, 581.3125],
				},
				{
					coordinates: [-115.4375, 582.4375],
				},
				{
					coordinates: [-113.3125, 587.5],
				},
				{
					coordinates: [-110.5625, 591.25],
					text: 'While navigating the tough terrain, both the Ranger and Sorcerer fail an athletics check and get injured.',
				},
				{
					coordinates: [-106.5625, 593.5],
				},
				{
					coordinates: [-101.9375, 594.75],
				},
				{
					coordinates: [-97.125, 596.5625],
				},
				{
					coordinates: [-94.75, 597.3125],
				},
				{
					coordinates: [-93.3125, 599.875],
				},
				{
					coordinates: [-90.1875, 600.3125],
					text: 'The group spots an inactive golem to their right, which catches their interest.',
				},
				{
					coordinates: [-86.25, 600.6875],
				},
				{
					coordinates: [-81.8125, 602.875],
				},
				{
					coordinates: [-79.875, 604.3125],
				},
				{
					coordinates: [-77.25, 604.3125],
					text: 'They pay 2 silver per person to cross the river over a shaky bridge guarded by a troll.',
				},
				{
					coordinates: [-70.3125, 604],
				},
				{
					coordinates: [-64.875, 603],
				},
				{
					coordinates: [-62.3125, 602.1875],
				},
				{
					coordinates: [-58.1875, 602.0625],
				},
				{
					coordinates: [-55.1875, 602.125],
				},
				{
					coordinates: [-51.25, 601.625],
				},
				{
					coordinates: [-48.5625, 601.1875],
					text: 'To their right, they find ruins and two ancient chests, sparking their curiosity.',
				},
				{
					coordinates: [-45.3125, 601.375],
				},
				{
					coordinates: [-41.4375, 600.875],
					text: 'Straight ahead, they entered a group of tents and discovered the location of the water mages.',
				},
				{
					coordinates: [-39.75, 600.1875],
				},
				{
					coordinates: [-38.1875, 596.1875],
				},
				{
					coordinates: [-36.5, 592.5],
				},
				{
					coordinates: [-35.6875, 590.25],
				},
				{
					coordinates: [-36.125, 587.75],
				},
				{
					coordinates: [-38.625, 586.75],
				},
				{
					coordinates: [-41.25, 586.4375],
				},
				{
					coordinates: [-43.5, 585.25],
				},
				{
					coordinates: [-44.5625, 582.4375],
				},
				{
					coordinates: [-44.0625, 580.125],
				},
				{
					coordinates: [-41.5625, 580.125],
					text: 'The group entered the pyramids. In the first chamber they saw a huge door to their left, which was locked. Straight ahead through a corridor they fought a fierce battle against lich-like creatures and undead. They were victorious in the end with the help of the water mages party. Learning more about the strange devices of the land, they decided to help the mages with what looked like a teleporter. Once they stepped on it, they were teleported to a different location, but they managed to work out the system behind the teleporters: one would take you to a cave in the mountains, close to the city, and the other to another small cave near the inn.',
				},
				{
					coordinates: [-111.21875, 558.65625],
				},
				{
					coordinates: [-199.53125, 655.65625],
				},
				{
					coordinates: [-41.5625, 580.6875],
				},
				{
					coordinates: [-41.5625, 580.125],
				},
			],
		},
		{
			name: '08. Session 8 Recap',
			lineColor: '#ff5722',
			sessionId: 6,
			points: [
				{
					coordinates: [-111.625, 558.9375],
					text: 'This is where the previous session ended.',
				},
				{
					coordinates: [-115.9375, 560.125],
				},
				{
					coordinates: [-118.375, 559.3125],
				},
				{
					coordinates: [-120.4375, 553.375],
				},
				{
					coordinates: [-122.1875, 551.9375],
				},
				{
					coordinates: [-126, 552.1875],
				},
				{
					coordinates: [-131.25, 549.875],
				},
				{
					coordinates: [-140.0625, 545.25],
				},
				{
					coordinates: [-145.125, 548.8125],
				},
				{
					coordinates: [-152, 549.25],
				},
				{
					coordinates: [-159.1875, 552.3125],
				},
				{
					coordinates: [-161.25, 561.125],
				},
				{
					coordinates: [-161.125, 573.75],
				},
				{
					coordinates: [-160.0625, 586.25],
				},
				{
					coordinates: [-160.125, 601.0625],
				},
				{
					coordinates: [-159.625, 617.25],
				},
				{
					coordinates: [-160.1875, 638.875],
				},
				{
					coordinates: [-160.1875, 655.25],
				},
				{
					coordinates: [-162.9375, 667.8125],
				},
				{
					coordinates: [-167.0625, 674.5625],
				},
				{
					coordinates: [-170.5625, 675.375],
					text: 'Went into the inn and talked with the bartender, who was a follower of the water mages. Learned about the mercenaries and got a key to unlock the teleporter B lock.',
				},
				{
					coordinates: [-167.875, 676.25],
				},
				{
					coordinates: [-166.75, 677.625],
				},
				{
					coordinates: [-164.0625, 677.375],
				},
				{
					coordinates: [-161, 679.375],
				},
				{
					coordinates: [-160.9375, 694.5],
				},
				{
					coordinates: [-161.125, 721.5625],
				},
				{
					coordinates: [-161.0625, 743],
				},
				{
					coordinates: [-161.375, 769.75],
				},
				{
					coordinates: [-161.25, 794.9375],
				},
				{
					coordinates: [-162.8125, 796.4375],
				},
				{
					coordinates: [-166.25, 796.125],
				},
				{
					coordinates: [-173.1875, 796.125],
				},
				{
					coordinates: [-179.75, 796.375],
				},
				{
					coordinates: [-181.75, 798.5],
				},
				{
					coordinates: [-180.5, 802.3125],
					text: "Went to Erol's house and met with him. Learned about the guards and Silvestro's quota.",
				},
				{
					coordinates: [-179.75, 799.1875],
				},
				{
					coordinates: [-169.375, 797.125],
				},
				{
					coordinates: [-164.375, 797.25],
				},
				{
					coordinates: [-161.5, 798.5625],
				},
				{
					coordinates: [-161.4375, 805.3125],
				},
				{
					coordinates: [-161.5, 827.4375],
				},
				{
					coordinates: [-161.9375, 846],
				},
				{
					coordinates: [-161.75, 862.25],
				},
				{
					coordinates: [-161.8125, 872.3125],
					text: 'Saw a meadow with a lot of cows and sheep on the right, and huge farmlands to the left.',
				},
				{
					coordinates: [-161.5625, 882.375],
				},
				{
					coordinates: [-161.6875, 897.5625],
				},
				{
					coordinates: [-159.5625, 899.8125],
					text: 'Decided to make a left turn here towards the farm.',
				},
				{
					coordinates: [-150.6875, 899.3125],
				},
				{
					coordinates: [-136.625, 898.25],
				},
				{
					coordinates: [-125.9375, 897.9375],
				},
				{
					coordinates: [-110.3125, 897.375],
				},
				{
					coordinates: [-98.3125, 897.75],
				},
				{
					coordinates: [-92.625, 898.1875],
				},
				{
					coordinates: [-89.9375, 897.25],
					text: 'Met up with Silvestro, learned about the farm and paid the 20 gold per person tax.',
				},
				{
					coordinates: [-86.625, 895.875],
				},
				{
					coordinates: [-84.25, 893.625],
					text: 'Met up with the two merchants - Quixie and Jabba the Hutt. Bought 1 haste potion and two items for approximately 1000g.',
				},
				{
					coordinates: [-85.3125, 891.25],
				},
				{
					coordinates: [-85, 882.375],
					text: 'Saw that the inn to the left was holding a competition for whoever could eat the most chocolate. Nobody could resist such temptation.',
				},
				{
					coordinates: [-80.9375, 879.375],
				},
				{
					coordinates: [-79.25, 877.5625],
				},
				{
					coordinates: [-79.125, 872.75],
				},
				{
					coordinates: [-79.5625, 868.75],
				},
				{
					coordinates: [-78.125, 864.9375],
					text: 'Entered the contest - the Cleric and the Barbarian won, and ate a stew which increased their max HP by 5. The others puked.',
				},
				{
					coordinates: [-76.875, 871.125],
				},
				{
					coordinates: [-76.125, 876.375],
				},
				{
					coordinates: [-77.3125, 879.5625],
				},
				{
					coordinates: [-77.6875, 887.375],
				},
				{
					coordinates: [-75.1875, 888.9375],
				},
				{
					coordinates: [-71.375, 889.3125],
				},
				{
					coordinates: [-68.25, 888.375],
					text: "Met up with General Lee and learned that they wanted to leave the island and were planning to take over the city. While trying to help, the party might've accidentally killed Captain Cunts by revealing his location to the pirate queen Bianca. Lee told the party, under the condition that they help Lee's lieutenants too, that the valley of mines was currently under siege by the Lizardmen, and that the only 'safe' entrance was through another path his spies had been using for a while.",
				},
				{
					coordinates: [-69, 893.3125],
					text: 'Met up with another follower of the Water Mages guild who was training the mercenary recruits. Trained with him and gained expertise with chosen weapons.',
				},
				{
					coordinates: [-74.8125, 893],
				},
				{
					coordinates: [-73.75, 902.9375],
				},
				{
					coordinates: [-67.3125, 906.875],
				},
				{
					coordinates: [-62.6875, 908.5],
				},
				{
					coordinates: [-61.9375, 910.9375],
					text: 'Went to the Blacksmith to learn about their trade.',
				},
				{
					coordinates: [-64.25, 911.6875],
				},
				{
					coordinates: [-68.0625, 908.125],
				},
				{
					coordinates: [-78.375, 902.5625],
				},
				{
					coordinates: [-89.125, 898.875],
				},
				{
					coordinates: [-94.4375, 896.5625],
				},
				{
					coordinates: [-112.5625, 895.125],
				},
				{
					coordinates: [-126.125, 896.3125],
				},
				{
					coordinates: [-150.25, 896.75],
				},
				{
					coordinates: [-158.9375, 897.375],
				},
				{
					coordinates: [-159.0625, 870.1875],
				},
				{
					coordinates: [-158.875, 833],
				},
				{
					coordinates: [-158.875, 812.0625],
					text: 'Noticed there was another set of guards compared to the first time.',
				},
				{
					coordinates: [-158.5625, 790.1875],
				},
				{
					coordinates: [-158.3125, 748],
				},
				{
					coordinates: [-158.6875, 711.625],
				},
				{
					coordinates: [-158.5625, 692.6875],
					text: 'Made a left turn here towards the Penal Colony. What could go wrong?',
				},
				{
					coordinates: [-164.3125, 693.4375],
				},
				{
					coordinates: [-176.0625, 696.25],
				},
				{
					coordinates: [-188.25, 699.3125],
				},
				{
					coordinates: [-205, 700.125],
				},
				{
					coordinates: [-217, 700.4375],
				},
				{
					coordinates: [-222, 700.5625],
					text: 'In front of them, they saw the road and two paladins standing guard. To their right, a ruined tower; to their left, farmland.',
				},
				{
					coordinates: [-226.4375, 700.875],
				},
				{
					coordinates: [-233.125, 695.3125],
				},
				{
					coordinates: [-238.5, 685.75],
					text: 'Their passive perception not enough, the party was ambushed by a party of 3 orc mages - each master of a different element: fire, ice and lightning. After a fierce battle, they emerged victorious.',
				},
			],
		},
		{
			name: '09. Session 9 Recap',
			lineColor: 'rgb(188 64 255)',
			sessionId: 7,
			points: [
				{
					coordinates: [-242.625, 686.375],
					text: 'This is where the last session ended.',
				},
				{
					coordinates: [-250.375, 691.625],
				},
				{
					coordinates: [-254.375, 698.625],
					text: 'The adventurers talked to 2 mercenaries and found out that 2 more mages were in the area, and a farmer had been killed by one of them.',
				},
				{
					coordinates: [-226, 698.375],
				},
				{
					coordinates: [-201.875, 698.875],
				},
				{
					coordinates: [-185.75, 697.5],
				},
				{
					coordinates: [-173, 695.25],
				},
				{
					coordinates: [-162.75, 692.375],
				},
				{
					coordinates: [-160.375, 684.625],
				},
				{
					coordinates: [-162.25, 678.75],
				},
				{
					coordinates: [-173.125, 678.875],
					text: 'The party went back to the inn to rest, learning from General Lee that they had also been attacked.',
					lights: {
						coordinates: [
							[-166.59375, 679.25],
							[-151, 678.125],
							[-163.9375, 799],
							[-182.3125, 799.5625],
							[-156.125, 832.5625],
							[-156.25, 872.1875],
							[-164.25, 882.375],
							[-200.25, 869.6875],
							[-128.4375, 899.75],
							[-125.0625, 875.5],
							[-86.5625, 884.5625],
							[-71.8125, 887.875],
							[-61.5, 909.125],
							[-84, 819.5],
							[-290.75, 788.5625],
							[-294.3125, 704.6875],
							[-89.1875, 814.6875],
							[-73.625, 819.3125],
							[-95.5, 867.03125],
							[-77.90625, 866.0625],
							[-86.53125, 855.1875],
							[-356.6875, 700.5625],
							[-428.21875, 679.21875],
							[-416.21875, 532.15625],
							[-479.96875, 535.09375],
							[-481.75, 547.8125],
							[-478.9375, 580.6875],
							[-503.125, 585.4375],
							[-510.875, 565.25],
							[-484.25, 517.375],
						],
						intensity: 0.5,
						radius: 60,
						type: 'warm',
					},
				},
				{
					coordinates: [-174.875, 673.125],
				},
				{
					coordinates: [-166.25, 672.5],
				},
				{
					coordinates: [-164.75, 675.5],
				},
				{
					coordinates: [-157.125, 679],
				},
				{
					coordinates: [-158, 688.75],
					text: 'The adventurers decided to speak to General Lee directly.',
				},
				{
					coordinates: [-158.125, 703.375],
				},
				{
					coordinates: [-158.5, 724.625],
					text: "Entering Oviedo's farm domain, they saw a large figure and encountered Silvestro and another individual.",
				},
				{
					coordinates: [-158.75, 801.75],
					text: 'They confronted Silvestro and the other guy, who denied being werewolves and claimed they used potions to enlarge themselves.',
				},
				{
					coordinates: [-158.5, 854.375],
				},
				{
					coordinates: [-158, 896.5],
				},
				{
					coordinates: [-123.375, 896.625],
				},
				{
					coordinates: [-92.25, 896.375],
				},
				{
					coordinates: [-85.75, 892],
				},
				{
					coordinates: [-84.5, 883.625],
				},
				{
					coordinates: [-77.625, 888.125],
				},
				{
					coordinates: [-71.125, 889.25],
					text: "Having reached and woken up Lee, the group informed Lee about Bianca's treachery and the pyramid's location.",
				},
				{
					coordinates: [-77, 900.875],
				},
				{
					coordinates: [-93.625, 898.75],
				},
				{
					coordinates: [-161.25, 899.375],
				},
				{
					coordinates: [-161, 787.75],
				},
				{
					coordinates: [-160.75, 695.75],
					text: 'They headed towards the Penal Colony.',
				},
				{
					coordinates: [-168.25, 695.625],
				},
				{
					coordinates: [-187.625, 700.75],
				},
				{
					coordinates: [-241.625, 701.375],
				},
				{
					coordinates: [-293.125, 701.875],
				},
				{
					coordinates: [-315, 703.625],
				},
				{
					coordinates: [-348, 703.75],
				},
				{
					coordinates: [-359.25, 699.0625],
					text: 'Upon reaching 2 Paladins guarding the entrance, they received 2 keys and passage into the Penal Colony.',
				},
				{
					coordinates: [-364.25, 702.625],
				},
				{
					coordinates: [-369.875, 703],
				},
				{
					coordinates: [-376.625, 704.0625],
				},
				{
					coordinates: [-381.5625, 705.1875],
					overlays: ['Penal Colony Spider Cave'],
				},
				{
					coordinates: [-385.34375, 708.34375],
					text: 'The adventurers entered the shortcut as Lee had advised.',
				},
				{
					coordinates: [-385.125, 714.84375],
				},
				{
					coordinates: [-386.4375, 716.5625],
					text: 'However, in the middle of the cave, they were ambushed by spiders and barely escaped.',
				},
				{
					coordinates: [-388.1875, 716],
				},
				{
					coordinates: [-389.78125, 714.625],
				},
				{
					coordinates: [-393.28125, 714.71875],
					overlays: [],
				},
				{
					coordinates: [-395.78125, 714.46875],
				},
				{
					coordinates: [-394.40625, 699.40625],
				},
				{
					coordinates: [-392.90625, 691.84375],
					text: 'In front of them there were abandoned mines, which they figured were the way Lee had suggested to go.',
					overlays: ['Penal Colony Mine Cave'],
				},
				{
					coordinates: [-391.90625, 687.6875],
				},
				{
					coordinates: [-391.625, 684.75],
				},
				{
					coordinates: [-389.8125, 678.8125],
				},
				{
					coordinates: [-390.8125, 671.1875],
				},
				{
					coordinates: [-391.375, 667.84375],
				},
				{
					coordinates: [-388.65625, 666.125],
				},
				{
					coordinates: [-385.4375, 666.625],
				},
				{
					coordinates: [-382.71875, 666.40625],
				},
				{
					coordinates: [-381.03125, 663.65625],
				},
				{
					coordinates: [-377.96875, 660.875],
				},
				{
					coordinates: [-376.71875, 655.5],
				},
				{
					coordinates: [-378.0625, 649.3125],
				},
				{
					coordinates: [-380.09375, 644.4375],
				},
				{
					coordinates: [-381.09375, 641],
				},
				{
					coordinates: [-383.15625, 637.25],
				},
				{
					coordinates: [-384.21875, 634.09375],
				},
				{
					coordinates: [-387.46875, 630.8125],
				},
				{
					coordinates: [-390.0625, 627.1875],
				},
				{
					coordinates: [-391.28125, 624.3125],
				},
				{
					coordinates: [-390.8125, 619.90625],
				},
				{
					coordinates: [-390.5625, 614.78125],
				},
				{
					coordinates: [-390, 608.75],
				},
				{
					coordinates: [-392.71875, 608.0625],
				},
				{
					coordinates: [-393.875, 611.21875],
				},
				{
					coordinates: [-394.84375, 613.78125],
				},
				{
					coordinates: [-398.375, 614.34375],
				},
				{
					coordinates: [-401.84375, 615.3125],
				},
				{
					coordinates: [-401.59375, 619.21875],
				},
				{
					coordinates: [-400.3125, 621.6875],
				},
				{
					coordinates: [-397.96875, 623.34375],
				},
				{
					coordinates: [-395.21875, 625.65625],
				},
				{
					coordinates: [-395.78125, 629.5625],
				},
				{
					coordinates: [-399.0625, 631.09375],
				},
				{
					coordinates: [-402.59375, 631.71875],
				},
				{
					coordinates: [-404.25, 636.9375],
				},
				{
					coordinates: [-404.09375, 644.09375],
				},
				{
					coordinates: [-406.71875, 647.5],
				},
				{
					coordinates: [-409.34375, 646.375],
				},
				{
					coordinates: [-410.28125, 643.03125],
				},
				{
					coordinates: [-411, 640.875],
				},
				{
					coordinates: [-413.375, 641.96875],
				},
				{
					coordinates: [-415.78125, 645.375],
				},
				{
					coordinates: [-418.125, 645.71875],
				},
				{
					coordinates: [-418.84375, 646.25],
					text: 'Approaching the mine exit, they found themselves on a ledge, from which they could see the Paladin citadel in the distance. Deciding the best course of action, they tied roped to the cave wall and climbed down from the ledge safely.',
					lights: null,
				},
				{
					coordinates: [-421.9375, 646.28125],
				},
				{
					coordinates: [-429, 648.46875],
				},
				{
					coordinates: [-428.65625, 643.5625],
				},
				{
					coordinates: [-423.34375, 635.6875],
				},
				{
					coordinates: [-423.15625, 629.0625],
				},
				{
					coordinates: [-430.5, 619.21875],
				},
				{
					coordinates: [-437.625, 612.8125],
				},
				{
					coordinates: [-444.9375, 608.125],
				},
				{
					coordinates: [-442.96875, 603.71875],
				},
				{
					coordinates: [-436.75, 597.375],
				},
				{
					coordinates: [-431.375, 596.71875],
					overlays: ['Penal Colony Merchants Cave'],
				},
				{
					coordinates: [-424.4375, 590.15625],
					text: 'Climbing up a ladder, they met two merchants - a penguin named Zero and a drugged rabbit called Quickse - they purchased some items, and took a long rest to replenish their stamina and health.',
				},
				{
					coordinates: [-431.46875, 594.75],
				},
				{
					coordinates: [-437.375, 596],
				},
				{
					coordinates: [-444.71875, 603.40625],
				},
				{
					coordinates: [-453.65625, 597.5],
					overlays: [],
				},
				{
					coordinates: [-445.96875, 583.9375],
					text: 'The adventurers were ambushed by dinosaurs and were nearly wiped out.',
					level: 7,
				},
				{
					coordinates: [-442.875, 579.53125],
				},
				{
					coordinates: [-438.875, 576.90625],
					text: 'Just as the battle was ending, Diego appeared, clearly a werewolf. After talking with the adventurers, he decided to take them to his hideout.',
				},
				{
					coordinates: [-436.15625, 562.75],
				},
				{
					coordinates: [-429.375, 554.40625],
				},
				{
					coordinates: [-425.96875, 546.09375],
				},
				{
					coordinates: [-420.28125, 543.34375],
				},
				{
					coordinates: [-420.3125, 537.6875],
				},
				{
					coordinates: [-417.5625, 531.875],
				},
				{
					coordinates: [-415.65625, 531.46875],
					text: "They reached Diego's hideout, concluding the session.",
				},
			],
		},
		{
			name: '10. Session 10 Recap',
			lineColor: '#bf3636',
			sessionId: 8,
			points: [
				{
					coordinates: [-418.625, 534.5],
					text: "This is where the session started. At Diego's, the party took a long rest to prepare for their journey to the paladin citadel.",
				},
				{
					coordinates: [-419.5, 530.25],
					text: 'Hearing a loud bang, they looked to the harbour area and witnessed a dragon demolishing a large wall from the sea filled with portals. After that, they saw the Wicked Wench bombing the harbour.',
				},
				{
					coordinates: [-422.5, 536],
				},
				{
					coordinates: [-421.875, 541.375],
					text: 'Some of the lizardmen retreated after a gong was sounded, revealing it was their weekend, which they spent not taking part in any fights.',
				},
				{
					coordinates: [-427.25, 545.75],
				},
				{
					coordinates: [-429.5, 551.375],
				},
				{
					coordinates: [-439.875, 549],
				},
				{
					coordinates: [-448.25, 538.5],
				},
				{
					coordinates: [-451.875, 521.75],
					text: 'The group headed towards the citadel, taking the route leading to the battering ram section of the wall.',
				},
				{
					coordinates: [-454.5, 509],
				},
				{
					coordinates: [-458.375, 494.625],
				},
				{
					coordinates: [-460.875, 484.75],
					text: 'In the distance, they spotted a wooden fence with a fallen paladin nearby.',
				},
				{
					coordinates: [-456, 478.25],
				},
				{
					coordinates: [-449.5, 472.125],
				},
				{
					coordinates: [-445.25, 467.875],
				},
				{
					coordinates: [-443.75, 461.375],
				},
				{
					coordinates: [-440.75, 457.875],
				},
				{
					coordinates: [-437.25, 460.75],
					text: 'The ranger stealthily approached and discovered the dead paladin, two more deceased members who looked like prisoners, and several holes in the ground. Nearby were six carts filled with ore and a letter inside the shack.',
				},
				{
					coordinates: [-438.625, 455.125],
				},
				{
					coordinates: [-445.75, 455.875],
				},
				{
					coordinates: [-448.75, 465.375],
				},
				{
					coordinates: [-458, 471.375],
				},
				{
					coordinates: [-467.5, 478.875],
				},
				{
					coordinates: [-468, 485.46875],
					text: 'They executed their plan: the sorcerer, bard, and ranger transformed into wargs, Mitzy started to run, the barbarian consumed drugs, and the cleric flew invisibly into the sky.',
				},
				{
					coordinates: [-475.875, 488.375],
				},
				{
					coordinates: [-483.75, 479.625],
				},
				{
					coordinates: [-497.5, 480.125],
				},
				{
					coordinates: [-505, 486.25],
					overlays: ['Penal Colony Chapel', 'Penal Colony Paladin Barracks'],
				},
				{
					coordinates: [-509, 492.625],
					text: "The cleric reached the citadel and informed the guards of the party's arrival while discussing soup recipes. The barbarian and two wargs arrived at the citadel after several failed attempts; the barbarian got impaled on barbs, and the wargs struggled with the jumps. The last warg, the bard, failed an intelligence check and chased squirrels but eventually made it.",
				},
				{
					coordinates: [-513.625, 498],
				},
				{
					coordinates: [-512.5, 507.375],
					text: 'Upon reaching the citadel, they dispelled their warg transformations.',
				},
				{
					coordinates: [-515.875, 513.25],
				},
				{
					coordinates: [-523.875, 509.625],
					text: 'They spoke to the paladin in charge - a guy called Garrond - and learned only 11 carts had been mined.',
				},
				{
					coordinates: [-519.875, 516.375],
				},
				{
					coordinates: [-519.625, 528.625],
				},
				{
					coordinates: [-522.375, 535.25],
					text: 'Two members visited the chapel to talk to the fire mage while the other three spoke with new riders. The riders were dragon hunters who arrived on flying beasts after hearing a dragon was spotted in these lands. Upon request, they agreed to helping the party escape the citadel again either by carrying them or by casting Fly on them.',
				},
				{
					coordinates: [-527.875, 531.25],
				},
				{
					coordinates: [-536.25, 535.125],
					text: 'In the chapel, they learned the other party member was imprisoned with a ransom of 1000 gold. The fire mage would contribute 250, they had an idol/statue worth 250, and they pooled the remaining 500 in gold and jewelry.',
				},
				{
					coordinates: [-523.25, 526.375],
				},
				{
					coordinates: [-524.75, 515.625],
				},
				{
					coordinates: [-526.625, 509.5],
					text: 'They went back to rescue Gorn, Diegos comrade. After that, they chose to go back to the chapel to devise a plan.',
				},
				{
					coordinates: [-527.5, 522.25],
				},
				{
					coordinates: [-545.75, 539.375],
					text: "After a long talk, they formulated the plan: two members (Bard and Sorcerer) would teleport via Dimension Door to Diego's hut, while the others would inquire the help of the dragon hunters. If they could cast Fly on them, then the Sorcerer would cast Invisibility on each of them and they would fly. If they couldn't fly themselves, then the riders would carry them, though that would be more dangerous.",
				},
				{
					coordinates: [-542.375, 540.375],
				},
				{
					coordinates: [-528.375, 539],
					text: 'They got three Fly potions from the dragon riders.',
				},
				{
					coordinates: [-514.75, 536],
				},
				{
					coordinates: [-509, 532.875],
					text: "They put their plan into action: the sorcerer cast Dimension Door to Diego's Hut, while the others drank the Fly potions and got Invisibile. They had to go slower, because the Ranger was also carrying Mitzy. The Fire Mage and the Mercenary used a spell to teleport towards the open sea and swim towards Korinis.",
					overlays: [],
				},
				{
					coordinates: [-469.125, 545.75],
				},
				{
					coordinates: [-448.75, 553.25],
				},
				{
					coordinates: [-429.75, 555.875],
					text: "Near Diego's hut, they were ambushed by hooded figures: four mages, one barbarian, and one rogue. After a fierce battle, they emerged victorious.",
				},
				{
					coordinates: [-426.125, 549],
				},
				{
					coordinates: [-419.625, 543],
				},
				{
					coordinates: [-417.875, 536.875],
					text: "At Diego's, they took turns resting. Six hours in, Diego returned with trolls and a huge coffer. The coffer exploded during opening, containing 10 otter hides and some gold, which Diego split with the party. They decided to leave the Penal Colony, taking the route they came from.",
				},
				{
					coordinates: [-416.25, 542.625],
				},
				{
					coordinates: [-424.125, 550.125],
				},
				{
					coordinates: [-428.375, 559],
				},
				{
					coordinates: [-437.75, 565.625],
				},
				{
					coordinates: [-439.625, 577.75],
				},
				{
					coordinates: [-441.375, 595.625],
				},
				{
					coordinates: [-444.75, 608.125],
				},
				{
					coordinates: [-435, 614.5],
				},
				{
					coordinates: [-424.875, 625.375],
				},
				{
					coordinates: [-423.125, 634.25],
				},
				{
					coordinates: [-427.625, 643.75],
					overlays: ['Penal Colony Mine Cave'],
				},
				{
					coordinates: [-422.125, 645.75],
				},
				{
					coordinates: [-414.125, 643.625],
				},
				{
					coordinates: [-411.375, 640.625],
				},
				{
					coordinates: [-409.375, 646.625],
				},
				{
					coordinates: [-405.125, 646.375],
				},
				{
					coordinates: [-404.25, 633.25],
				},
				{
					coordinates: [-401.5, 630.875],
				},
				{
					coordinates: [-398.625, 631.625],
				},
				{
					coordinates: [-395, 627.625],
				},
				{
					coordinates: [-397.25, 623.75],
				},
				{
					coordinates: [-401.125, 621.875],
				},
				{
					coordinates: [-401.75, 615.75],
				},
				{
					coordinates: [-397.625, 614.375],
				},
				{
					coordinates: [-394.25, 614.125],
				},
				{
					coordinates: [-393.25, 608.625],
				},
				{
					coordinates: [-391, 607.625],
				},
				{
					coordinates: [-390, 614.125],
				},
				{
					coordinates: [-391.25, 622.125],
				},
				{
					coordinates: [-388.125, 630],
				},
				{
					coordinates: [-382.75, 636.875],
				},
				{
					coordinates: [-378.125, 646.75],
				},
				{
					coordinates: [-376.125, 655.5],
				},
				{
					coordinates: [-380.125, 661.5],
				},
				{
					coordinates: [-384.375, 668],
				},
				{
					coordinates: [-388, 666.25],
				},
				{
					coordinates: [-392.125, 667.75],
				},
				{
					coordinates: [-389.75, 674.25],
					overlays: [],
				},
				{
					coordinates: [-393.375, 692.75],
				},
				{
					coordinates: [-395.125, 713.625],
					overlays: ['Penal Colony Spider Cave'],
				},
				{
					coordinates: [-393.5625, 714.53125],
				},
				{
					coordinates: [-388.75, 715.28125],
				},
				{
					coordinates: [-386.90625, 714.71875],
				},
				{
					coordinates: [-385.09375, 709.4375],
					overlays: [],
				},
				{
					coordinates: [-384.1875, 705.875],
				},
				{
					coordinates: [-381.375, 705.15625],
					text: 'Made it safely to the paladin checkpoint.',
				},
				{
					coordinates: [-367.5625, 703.0625],
				},
				{
					coordinates: [-365.71875, 703.40625],
					text: "As they approached the checkpoint, they saw that its entrance had been destroyed and that the two paladin guards had been killed. They contacted Lee, who sent reinforcements to help them flee. In the conversation, they learned that those creatures' names were seekers.",
				},
				{
					coordinates: [-355, 702.375],
				},
				{
					coordinates: [-333.5, 703.375],
				},
				{
					coordinates: [-307, 703],
				},
				{
					coordinates: [-285.5, 700.625],
					text: 'They chose to head back to the tavern and then towards Lee.',
				},
				{
					coordinates: [-265.625, 700.875],
				},
				{
					coordinates: [-239.375, 700.25],
				},
				{
					coordinates: [-215, 700.75],
				},
				{
					coordinates: [-181.25, 698.125],
				},
				{
					coordinates: [-167.875, 694.375],
					text: "At the crossroads, they saw other seekers waiting to ambush them, so they decided to take a detour through the lake and towards Erol's house.",
				},
				{
					coordinates: [-167.25, 699.875],
				},
				{
					coordinates: [-175.75, 704.5],
				},
				{
					coordinates: [-182.625, 707.625],
				},
				{
					coordinates: [-177.75, 712.25],
				},
				{
					coordinates: [-171.75, 717.375],
				},
				{
					coordinates: [-171.125, 721.75],
				},
				{
					coordinates: [-171.875, 728],
				},
				{
					coordinates: [-176.5, 733.25],
				},
				{
					coordinates: [-185.875, 734.5],
				},
				{
					coordinates: [-193.875, 736.125],
				},
				{
					coordinates: [-197.625, 741.5],
				},
				{
					coordinates: [-202.75, 746.25],
				},
				{
					coordinates: [-199.375, 751.875],
				},
				{
					coordinates: [-194.375, 761.875],
				},
				{
					coordinates: [-189.5, 772],
				},
				{
					coordinates: [-187.875, 782.625],
				},
				{
					coordinates: [-185.125, 791],
				},
				{
					coordinates: [-181.5, 793.5],
					text: "Reaching Erol's house (barely, for the party Cleric), they talked with him and then went onwards to General Lee.",
				},
				{
					coordinates: [-176, 797.25],
				},
				{
					coordinates: [-161.5, 796.75],
				},
				{
					coordinates: [-159.25, 813.875],
				},
				{
					coordinates: [-159.875, 838.875],
				},
				{
					coordinates: [-159, 868.5],
				},
				{
					coordinates: [-159.5, 884.75],
					text: "They saw more seekers straight ahead, guarding the entrance towards the mountain path. They had their backs turned towards them, so they didn't spot the party.",
				},
				{
					coordinates: [-159.25, 897.875],
				},
				{
					coordinates: [-149.125, 898.25],
				},
				{
					coordinates: [-126.5, 897.125],
				},
				{
					coordinates: [-99, 896.75],
				},
				{
					coordinates: [-92.125, 897.125],
					text: 'To their right, up in the abandoned tower, there were more seekers waiting to ambush.',
				},
				{
					coordinates: [-86, 893.5],
					text: 'Talked to Zero and Quixie and learned that she had bought some more items.',
				},
				{
					coordinates: [-85, 884.25],
				},
				{
					coordinates: [-76.25, 886.375],
				},
				{
					coordinates: [-71, 888.25],
					text: 'They arranged to meet Lee at the pyramids the next day and received 2000 gold as thanks for their aid.',
				},
				{
					coordinates: [-79.75, 900.875],
				},
				{
					coordinates: [-94.5, 898.75],
					text: 'They all turned invisible in order to avoid the seekers and started to go back towards the tavern, to use the teleporter to the city.',
				},
				{
					coordinates: [-157.875, 895.875],
				},
				{
					coordinates: [-158.5, 786.125],
				},
				{
					coordinates: [-159.75, 714.625],
				},
				{
					coordinates: [-159.625, 695.125],
					text: 'Near the tavern they saw Diego and shouted towards him to come with them via the teleporters.',
				},
				{
					coordinates: [-160.5, 679.875],
				},
				{
					coordinates: [-167.75, 676.625],
				},
				{
					coordinates: [-174.875, 669.5],
				},
				{
					coordinates: [-182.5, 666.875],
				},
				{
					coordinates: [-201, 655.875],
					text: 'Reaching the teleporter location, they entered the cave and used the teleporter.',
				},
				{
					coordinates: [-201, 655.875],
				},
				{
					coordinates: [-42.625, 580.75],
					text: 'Upon reaching the pyramid, they saw 4 black mercenary guards guarding the teleporter, and then proceeded towards the other location.',
				},
				{
					coordinates: [-42.625, 580.75],
				},
				{
					coordinates: [-113.25, 560.125],
					text: 'Exiting the cave and the teleporter, they decided to go towards the city.',
				},
				{
					coordinates: [-117.75, 561],
				},
				{
					coordinates: [-120.75, 552.75],
					text: 'They saw a few more seekers, some of them were waiting to ambush them on the road to Korinis, while the others were waiting on the path towards the lighthouse.',
				},
				{
					coordinates: [-126.25, 552.25],
				},
				{
					coordinates: [-138.625, 546],
				},
				{
					coordinates: [-141.875, 534.625],
				},
				{
					coordinates: [-141.875, 511.625],
				},
				{
					coordinates: [-142.375, 489.125],
					text: 'Safely into the city, they parted ways with Diego, who had some business to attend to in the upper city.',
				},
				{
					coordinates: [-151.375, 490],
				},
				{
					coordinates: [-152.125, 474.625],
				},
				{
					coordinates: [-157.75, 469.875],
				},
				{
					coordinates: [-156.875, 458.125],
				},
				{
					coordinates: [-158.375, 442.125],
				},
				{
					coordinates: [-167.625, 435.875],
				},
				{
					coordinates: [-168.25, 430],
				},
				{
					coordinates: [-165.625, 427.75],
					text: 'They visited Thorben, who reprimanded the Ranger for being the worst apprentice he had ever had. The ranger did buy 40 +hit arrows and 100 normal arrows. After that, they decided to go to the merchants area to buy some potions.',
				},
				{
					coordinates: [-158.5, 429.875],
				},
				{
					coordinates: [-153.75, 434.875],
				},
				{
					coordinates: [-148.875, 437.375],
				},
				{
					coordinates: [-142.875, 437.5],
				},
				{
					coordinates: [-141.25, 483.875],
				},
				{
					coordinates: [-135.625, 493.375],
				},
				{
					coordinates: [-135.125, 500],
				},
				{
					coordinates: [-130.625, 507.625],
					text: 'Having reached the merchants, they bought some mana and healing potions.',
				},
				{
					coordinates: [-132.125, 519.625],
				},
				{
					coordinates: [-139.25, 520.875],
				},
				{
					coordinates: [-141.75, 422.125],
				},
				{
					coordinates: [-147.375, 414.5],
				},
				{
					coordinates: [-156.5, 413.625],
				},
				{
					coordinates: [-163.375, 406.875],
				},
				{
					coordinates: [-172.875, 403.5],
				},
				{
					coordinates: [-181.25, 405.5],
				},
				{
					coordinates: [-189.75, 402.5],
				},
				{
					coordinates: [-191.75, 395.625],
					text: 'Saw Diego again as he was kicking out someone who had betrayed him. He offered the party a place to sleep in any time they wanted.',
				},
				{
					coordinates: [-200.28125, 398.90625],
				},
				{
					coordinates: [-206.5, 398.125],
				},
				{
					coordinates: [-206.28125, 401.53125],
					text: 'Entered Salamander and found out he had been scammed by the pirate. Session end.',
				},
			],
		},
		{
			name: '11. Session 11 Recap',
			lineColor: '#000000',
			sessionId: 9,
			points: [
				{
					coordinates: [-207.375, 401],
					text: 'This is where the previous session ended. The party went to Lord Heigan to get the pass to get the Eye of Sherridan.',
				},
				{
					coordinates: [-208.4375, 396.75],
				},
				{
					coordinates: [-210.6875, 395.5],
				},
				{
					coordinates: [-214.6875, 396],
				},
				{
					coordinates: [-216.375, 393.3125],
				},
				{
					coordinates: [-220.625, 391.0625],
					text: 'Talked to Heigan and got the pass.',
				},
				{
					coordinates: [-218.9375, 390.375],
				},
				{
					coordinates: [-214.3125, 392.5625],
				},
				{
					coordinates: [-209.8125, 394.4375],
				},
				{
					coordinates: [-204.25, 397.4375],
				},
				{
					coordinates: [-193.125, 397.625],
				},
				{
					coordinates: [-188.0625, 403],
				},
				{
					coordinates: [-182.5625, 404.6875],
				},
				{
					coordinates: [-174.125, 404],
				},
				{
					coordinates: [-165.5, 404.375],
				},
				{
					coordinates: [-161.5625, 408.5625],
				},
				{
					coordinates: [-153.125, 413.75],
				},
				{
					coordinates: [-148, 413.9375],
				},
				{
					coordinates: [-145.375, 416.3125],
				},
				{
					coordinates: [-141.875, 419.8125],
				},
				{
					coordinates: [-141.75, 439.4375],
				},
				{
					coordinates: [-142.0625, 472],
				},
				{
					coordinates: [-142.3125, 495.9375],
				},
				{
					coordinates: [-141.75, 515.6875],
				},
				{
					coordinates: [-140.8125, 533.6875],
				},
				{
					coordinates: [-141.125, 543.5],
				},
				{
					coordinates: [-138.4375, 546],
				},
				{
					coordinates: [-132.875, 548.5625],
				},
				{
					coordinates: [-127.8125, 551.5],
				},
				{
					coordinates: [-124.8125, 552.5625],
				},
				{
					coordinates: [-121.25, 552.1875],
				},
				{
					coordinates: [-119.25, 557],
				},
				{
					coordinates: [-117.625, 560.1875],
				},
				{
					coordinates: [-114.375, 559.8125],
				},
				{
					coordinates: [-111.625, 558.3125],
				},
				{
					coordinates: [-41.5625, 578.875],
					text: 'Went to the pyramids and slept. Got food and dicks drawn on face.',
					textColor: 'black',
				},
				{
					coordinates: [-196.65625, 656.8125],
					text: 'Teleported to the inn and went towards the monastery.',
					textColor: 'black',
				},
				{
					coordinates: [-191.8125, 658.0625],
				},
				{
					coordinates: [-186.875, 655.9375],
				},
				{
					coordinates: [-184, 658.4375],
				},
				{
					coordinates: [-181.0625, 657.875],
				},
				{
					coordinates: [-179.3125, 660.875],
				},
				{
					coordinates: [-172.8125, 661.9375],
				},
				{
					coordinates: [-168.3125, 664.5625],
				},
				{
					coordinates: [-166.4375, 667.25],
				},
				{
					coordinates: [-168.625, 672.875],
				},
				{
					coordinates: [-168.0625, 675.875],
				},
				{
					coordinates: [-167, 677.5],
				},
				{
					coordinates: [-165.125, 677.375],
				},
				{
					coordinates: [-158, 679.125],
				},
				{
					coordinates: [-152.0625, 676.6875],
				},
				{
					coordinates: [-142.4375, 673.875],
				},
				{
					coordinates: [-129, 674.8125],
				},
				{
					coordinates: [-126.6875, 678.75],
					text: 'Found dead mage with trails.',
				},
				{
					coordinates: [-123.8125, 675.875],
				},
				{
					coordinates: [-116.875, 673.9375],
				},
				{
					coordinates: [-108.5625, 672.6875],
				},
				{
					coordinates: [-101.625, 672.6875],
				},
				{
					coordinates: [-98.6875, 666.75],
				},
				{
					coordinates: [-97.5625, 655],
					text: 'Found Isgaroth dead.',
				},
				{
					coordinates: [-96.9375, 664.6875],
				},
				{
					coordinates: [-97.9375, 672.75],
				},
				{
					coordinates: [-89.0625, 672.3125],
				},
				{
					coordinates: [-78.75, 672.5625],
				},
				{
					coordinates: [-68.375, 671.5625],
				},
				{
					coordinates: [-60.1875, 670.4375],
					text: 'Talked to Milton and found out things.',
				},
				{
					coordinates: [-55.75, 673],
				},
				{
					coordinates: [-54, 679.375],
					text: 'Went inside and drank wine, bought things.',
				},
				{
					coordinates: [-53.875, 671.3125],
				},
				{
					coordinates: [-60.6875, 668.8125],
				},
				{
					coordinates: [-65.6875, 669.25],
				},
				{
					coordinates: [-65.5625, 661.375],
					text: 'Used fly to go to the pyramids.',
					textColor: 'black',
				},
				{
					coordinates: [-63, 625],
				},
				{
					coordinates: [-43.25, 584],
					text: 'Reached the pyramids and did long rest then used the eye of Sherridan to teleport to the final place. ',
					map: {
						name: 'final_location',
						exitZoom: 3,
						exitCoordinates: [-63.38, 89.25],
					},
				},
			],
		},
	],
	areas: {
		korinis_city: {
			name: 'Korinis city',
			items: [
				{
					name: 'Harbour Area',
					textRotation: '346deg',
					textSize: 14,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(220 223 228 / 50%)',
					points: [
						{
							coordinates: [-87.25, 372],
						},
						{
							coordinates: [-76, 374],
						},
						{
							coordinates: [-44.25, 499.75],
						},
						{
							coordinates: [-51.5, 511.25],
						},
						{
							coordinates: [-67.5, 480],
						},
						{
							coordinates: [-78.75, 432.5],
						},
						{
							coordinates: [-84.25, 413.25],
						},
						{
							coordinates: [-85.25, 387.5],
						},
					],
				},
				{
					name: 'Harbour',
					textRotation: '0deg',
					textSize: 16,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(248 113 104 / 50%)',
					points: [
						{
							coordinates: [-87.25, 373.5],
						},
						{
							coordinates: [-84.75, 386.25],
						},
						{
							coordinates: [-84.5, 407.75],
						},
						{
							coordinates: [-81.25, 425],
						},
						{
							coordinates: [-75.25, 436],
						},
						{
							coordinates: [-72.5, 460.25],
						},
						{
							coordinates: [-65.25, 474.5],
						},
						{
							coordinates: [-66.25, 483.75],
						},
						{
							coordinates: [-51, 509.25],
						},
						{
							coordinates: [-56.5, 516.25],
						},
						{
							coordinates: [-91, 517.25],
						},
						{
							coordinates: [-107.5, 531.25],
						},
						{
							coordinates: [-117.5, 519.75],
						},
						{
							coordinates: [-117.25, 380],
						},
					],
				},
				{
					name: 'Lower City',
					textRotation: '0deg',
					textSize: 16,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(245 205 71 / 30%)',
					points: [
						{
							coordinates: [-118, 379.25],
						},
						{
							coordinates: [-117, 518.75],
						},
						{
							coordinates: [-107, 530.5],
						},
						{
							coordinates: [-119.75, 541.5],
						},
						{
							coordinates: [-149.25, 541],
						},
						{
							coordinates: [-149.75, 528],
						},
						{
							coordinates: [-174, 484.25],
						},
						{
							coordinates: [-174, 370.25],
						},
						{
							coordinates: [-149.25, 379],
						},
						{
							coordinates: [-145.75, 380.25],
						},
					],
				},
				{
					name: 'Upper City',
					textRotation: '0deg',
					textSize: 16,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(87 157 255 / 40%)',
					points: [
						{
							coordinates: [-173.75, 371],
						},
						{
							coordinates: [-173.75, 485.25],
						},
						{
							coordinates: [-149.75, 529],
						},
						{
							coordinates: [-148, 541.5],
						},
						{
							coordinates: [-169, 535],
						},
						{
							coordinates: [-228.25, 505.5],
						},
						{
							coordinates: [-229.75, 379.25],
						},
						{
							coordinates: [-198.5, 370.75],
						},
					],
				},
			],
		},
		farms: {
			name: 'Farms',
			items: [
				{
					name: 'Secob Farm',
					textRotation: '0deg',
					textSize: 16,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(226 178 3 / 40%)',
					points: [
						{
							coordinates: [-141.75, 550.0625],
						},
						{
							coordinates: [-136.5, 556.6875],
						},
						{
							coordinates: [-135.4375, 563.5625],
						},
						{
							coordinates: [-136.375, 567.6875],
						},
						{
							coordinates: [-135.1875, 576.4375],
						},
						{
							coordinates: [-139, 585.75],
						},
						{
							coordinates: [-144.8125, 590.6875],
						},
						{
							coordinates: [-155.1875, 597.3125],
						},
						{
							coordinates: [-156.1875, 591.5625],
						},
						{
							coordinates: [-157.75, 579.625],
						},
						{
							coordinates: [-158, 569.6875],
						},
						{
							coordinates: [-155.125, 555.1875],
						},
						{
							coordinates: [-147.875, 553.375],
						},
						{
							coordinates: [-143.375, 553.5],
						},
					],
				},
				{
					name: 'Lobart farm',
					textRotation: '0deg',
					textSize: 16,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(226 178 3 / 40%)',
					points: [
						{
							coordinates: [-145.5, 251.25],
						},
						{
							coordinates: [-141.5, 259.5],
						},
						{
							coordinates: [-145.375, 283.15625],
						},
						{
							coordinates: [-143, 304],
						},
						{
							coordinates: [-143.75, 328],
						},
						{
							coordinates: [-141.5, 352],
						},
						{
							coordinates: [-161.75, 353],
						},
						{
							coordinates: [-171.25, 341.5],
						},
						{
							coordinates: [-174.75, 327],
						},
						{
							coordinates: [-181.75, 317.75],
						},
						{
							coordinates: [-185.75, 292.5],
						},
						{
							coordinates: [-184, 276.75],
						},
						{
							coordinates: [-172.5, 276.5],
						},
						{
							coordinates: [-170.75, 255.75],
						},
						{
							coordinates: [-166.75, 249],
						},
						{
							coordinates: [-157.5, 249],
						},
					],
				},
				{
					name: "Oviedo's Farm",
					textRotation: '0deg',
					textSize: 16,
					textFontType: 'title',
					lineColor: null,
					interiorColor: 'rgb(226 178 3 / 40%)',
					points: [
						{
							coordinates: [-152.5, 795.375],
						},
						{
							coordinates: [-128.25, 796.125],
						},
						{
							coordinates: [-122.5, 786],
						},
						{
							coordinates: [-105.875, 794.875],
						},
						{
							coordinates: [-97.5, 806.625],
						},
						{
							coordinates: [-90.625, 807.5],
						},
						{
							coordinates: [-77.625, 814.875],
						},
						{
							coordinates: [-75.625, 812.25],
						},
						{
							coordinates: [-58.5, 815.5],
						},
						{
							coordinates: [-54.75, 835.375],
						},
						{
							coordinates: [-59, 856.375],
						},
						{
							coordinates: [-56.5, 872.875],
						},
						{
							coordinates: [-69.125, 871.625],
						},
						{
							coordinates: [-73.75, 854.875],
						},
						{
							coordinates: [-87, 852.5],
						},
						{
							coordinates: [-96.625, 858.125],
						},
						{
							coordinates: [-105.375, 862.25],
						},
						{
							coordinates: [-110.75, 862.75],
						},
						{
							coordinates: [-121.875, 871.625],
						},
						{
							coordinates: [-123, 875.375],
						},
						{
							coordinates: [-115.5, 876.25],
						},
						{
							coordinates: [-105.625, 873],
						},
						{
							coordinates: [-99.875, 874.375],
						},
						{
							coordinates: [-86.375, 883.25],
						},
						{
							coordinates: [-85.875, 891],
						},
						{
							coordinates: [-89.375, 894.875],
						},
						{
							coordinates: [-155.5, 895.625],
						},
					],
				},
			],
		},
	},
	overlays: [
		{
			name: 'Penal Colony Mine Cave',
			bounds: [
				[-347.5, 596],
				[-420, 690],
			],
		},
		{
			name: 'Penal Colony Spider Cave',
			bounds: [
				[-380.2, 709.5],
				[-391.9, 720.4],
			],
		},
		{
			name: 'Penal Colony Merchants Cave',
			bounds: [
				[-411, 580],
				[-433, 604],
			],
		},
		{
			name: 'Penal Colony Chapel',
			bounds: [
				[-530.9, 527.2],
				[-556.6, 550],
			],
		},
		{
			name: 'Penal Colony Paladin Barracks',
			bounds: [
				[-516, 488],
				[-549, 521],
			],
		},
	],
	submaps: {
		interiors: {
			korinis_island_interior_pyramid_teleporter_c: {
				metadata: {
					path: 'maps/interiors/korinis_island/pyramid_teleporter/teleporter_c',
					mapId: 'korinis_teleporter_c',
					sizes: {
						maxZoom: 3,
						imageWidth: 1800,
						imageHeight: 1200,
					},
				},
				annotations: {
					points_of_interest: {
						name: 'Points of Interest',
						items: [
							{
								label: 'Teleporter to A (Pyramid)',
								lat: -110,
								lng: 196.625,
								type: 'place',
								mapLink: 'korinis_pyramid',
								map: {
									exitCoordinates: [-370, 610],
									exitZoom: 2,
								},
							},
						],
					},
					navigation_arrows: {
						name: 'Navigation arrows',
						items: [
							{
								label: 'To Korinis Island',
								lat: -38.625,
								lng: 63.125,
								type: 'place',
								mapLink: 'korinis_island',
								map: {
									exitCoordinates: [-195, 656],
									exitZoom: 4,
								},
							},
						],
					},
				},
			},
			korinis_island_interior_water_mages_pyramid: {
				metadata: {
					path: 'maps/interiors/korinis_island/water_mages_pyramid',
					mapId: 'korinis_pyramid',
					sizes: {
						maxZoom: 3,
						imageWidth: 7800,
						imageHeight: 4800,
					},
				},
				annotations: {
					navigation: {
						name: 'Navigation arrows',
						items: [
							{
								label: 'To Korinis Island',
								lat: -579.5,
								lng: 882,
								type: 'people',
								mapLink: 'korinis_island',
								map: {
									exitCoordinates: [-43, 580],
									exitZoom: 4,
								},
							},
							{
								label: 'Final Location',
								lat: -520.5,
								lng: 348,
								type: 'place',
								mapLink: 'final_location',
								map: {
									exitZoom: 3,
									exitCoordinates: [-63.38, 89.25],
								},
							},
						],
					},
				},
			},
		},
		encounters: {
			korinis_island_encounters_bandits_01: {
				metadata: {
					path: 'maps/encounters/korinis_island/bandit_encounters/bandit_encounter_01',
					mapId: 'korinis_bandits_01',
					sizes: {
						maxZoom: 3,
						imageWidth: 4800,
						imageHeight: 1800,
					},
				},
				annotations: {
					navigation: {
						name: 'Navigation arrows',
						items: [
							{
								label: 'Towards goblin camp',
								lat: -200,
								lng: 82.5,
								type: 'place',
								mapLink: 'korinis_island',
								map: {
									exitCoordinates: [-99, 318],
									exitZoom: 4,
								},
							},
							{
								label: "Bandits' hideout",
								lat: -200,
								lng: 498,
								type: 'place',
							},
						],
					},
				},
			},
			korinis_island_spider_cave: {
				metadata: {
					path: 'maps/encounters/korinis_island/spider_cave_encounter',
					mapId: 'korinis_spider_cave',
					sizes: {
						maxZoom: 3,
						imageWidth: 4095,
						imageHeight: 6144,
					},
				},
				annotations: {
					navigation: {
						name: 'Navigation arrows',
						items: [
							{
								label: 'To Penal Colony',
								lat: -764,
								lng: 262.5,
								type: 'people',
								mapLink: 'korinis_island',
								map: {
									exitCoordinates: [-395, 710],
									exitZoom: 4,
								},
							},
							{
								label: 'To Shortcut Terrace',
								lat: -10.5,
								lng: 419.5,
								type: 'people',
								mapLink: 'korinis_island',
								map: {
									exitCoordinates: [-395, 710],
									exitZoom: 4,
								},
							},
						],
					},
				},
			},
		},
	},
};

// --- Submap: Unnamed Island ---
const UNNAMED_ISLAND = {
	metadata: {
		path: 'maps/world_maps/unnamed_island_01',
		mapId: 'unnamed_island_01',
		sizes: {
			maxZoom: 3,
			imageWidth: 4096,
			imageHeight: 3072,
		},
	},
	annotations: {
		combat_encounters: {
			name: 'Combat encounters',
			items: [
				{
					label: 'Finneas combat encounter',
					lat: -126.625,
					lng: 314.75,
					type: 'place',
					mapLink: 'finneas_encounter',
				},
				{
					label: 'Dinosaurs combat encounter',
					lat: -193.5,
					lng: 241.5,
					type: 'place',
				},
			],
		},
		points_of_interest: {
			name: 'Points of Interest',
			items: [
				{
					label: 'Landing zone',
					lat: -329.375,
					lng: 203.125,
					type: 'place',
				},
				{
					label: 'Back to world map',
					lat: -367,
					lng: 16,
					type: 'text',
					fontSize: 15,
					mapLink: 'world_maps',
				},
			],
		},
	},
	paths: [
		{
			name: 'Session 1 Recap',
			sessionId: 1,
			points: [
				{
					coordinates: [-329.5, 180.75],
					text: 'Landed on beach.',
				},
				{
					coordinates: [-289.5, 222.5],
				},
				{
					coordinates: [-289.5, 222.5],
					text: 'Went up to the mountain path',
				},
				{
					coordinates: [-272, 227],
				},
				{
					coordinates: [-266.5, 214.5],
				},
				{
					coordinates: [-260, 206],
				},
				{
					coordinates: [-253.5, 212],
				},
				{
					coordinates: [-250.5, 223.5],
				},
				{
					coordinates: [-247.5, 229],
				},
				{
					coordinates: [-240, 232],
				},
				{
					coordinates: [-232.5, 232],
				},
				{
					coordinates: [-224, 226.5],
				},
				{
					coordinates: [-215.5, 226.5],
				},
				{
					coordinates: [-209.5, 235],
				},
				{
					coordinates: [-198.5, 229],
				},
				{
					coordinates: [-193.5, 241.5],
					text: 'Fought dinosaurs',
				},
				{
					coordinates: [-171, 244],
				},
				{
					coordinates: [-163, 257],
				},
				{
					coordinates: [-154, 271],
				},
				{
					coordinates: [-143, 277.5],
				},
				{
					coordinates: [-138.5, 286],
				},
				{
					coordinates: [-150.5, 289],
				},
				{
					coordinates: [-162, 296],
					text: 'Reached lake.',
				},
				{
					coordinates: [-147.5, 306],
					text: 'Climbed onto platforms.',
				},
				{
					coordinates: [-126.625, 314.75],
					text: 'Entered door, met Finneas, fought undeads.',
				},
				{
					coordinates: [-143.5, 324.5],
				},
				{
					coordinates: [-170, 305.5],
					text: 'Left, shot flare to notify the crew we found water.',
				},
				{
					coordinates: [-176, 289.5],
				},
				{
					coordinates: [-183, 277.5],
				},
				{
					coordinates: [-197.5, 276],
					text: 'Took another path down the mountain, found dead crew member parties bodies and looted them.',
				},
				{
					coordinates: [-209.5, 281.5],
				},
				{
					coordinates: [-215, 274.5],
				},
				{
					coordinates: [-222.5, 251.5],
				},
				{
					coordinates: [-222.5, 238.5],
				},
				{
					coordinates: [-225.75, 234],
				},
				{
					coordinates: [-236.5, 237.625],
				},
				{
					coordinates: [-248, 235],
				},
				{
					coordinates: [-254.625, 218.25],
				},
				{
					coordinates: [-262.5, 218],
				},
				{
					coordinates: [-273.25, 232.75],
				},
				{
					coordinates: [-298.625, 230],
					text: 'Saw the ship preparing to depart without waiting for us.',
				},
				{
					coordinates: [-317.375, 218.375],
				},
				{
					coordinates: [-317.375, 218.375],
				},
				{
					coordinates: [-346.875, 193.75],
				},
				{
					coordinates: [-351.75, 125.25],
					text: "Made a run for it and reached the ship back in time so we didn't get left behind.",
				},
			],
		},
	],
	submaps: {
		encounters: {
			finneas_encounter: {
				metadata: {
					path: 'maps/encounters/unnamed_island_01/finneas_dungeon',
					mapId: 'finneas_encounter',
					sizes: {
						maxZoom: 3,
						imageWidth: 7800,
						imageHeight: 4800,
					},
				},
			},
		},
	},
};

// ==========================================
// MAIN CAMPAIGN OBJECT
// ==========================================
export const CAMPAIGN_01 = {
	world_maps: {
		metadata: {
			path: 'maps/world_maps/world_map',
			mapId: 'world_maps',
			sizes: {
				maxZoom: 5,
				imageWidth: 8192,
				imageHeight: 8192,
			},
		},
		annotations: {
			points_of_interest: {
				name: 'Points of Interest',
				items: [
					{
						label: 'Initial town',
						lat: -159.25,
						lng: 206.25,
						type: 'place',
					},
					{
						label: 'First unnamed island',
						lat: -197.8125,
						lng: 165.125,
						type: 'place',
						mapLink: 'unnamed_island_01',
					},
					{
						label: 'Korinis',
						lat: -214.5,
						lng: 74.875,
						type: 'place',
						mapLink: 'korinis_island',
					},
				],
			},
			cities: {
				name: 'Cities & Towns',
				items: [
					{
						label: 'Ironmaster',
						lat: -17.46875,
						lng: 139.8125,
						type: 'place',
					},
					{
						label: 'Fireshear',
						lat: -32.375,
						lng: 143.78125,
						type: 'place',
					},
					{
						label: 'Luskan',
						lat: -35.625,
						lng: 154.21875,
						type: 'place',
					},
					{
						label: 'Blackford crossing',
						lat: -33.5625,
						lng: 157.5,
						type: 'place',
					},
					{
						label: 'Mirabar',
						lat: -26.25,
						lng: 175,
						type: 'place',
					},
					{
						label: "Morgur's Mound",
						lat: -37.59375,
						lng: 173.625,
						type: 'place',
					},
					{
						label: 'Gauntlgrym',
						lat: -44.5,
						lng: 165.875,
						type: 'place',
					},
					{
						label: 'Mount Hotenow',
						lat: -46.1875,
						lng: 163.71875,
						type: 'place',
					},
					{
						label: 'Neverwinter',
						lat: -52.28125,
						lng: 159.3125,
						type: 'place',
					},
					{
						label: "Helm's Hold",
						lat: -55.53125,
						lng: 164.25,
						type: 'place',
					},
					{
						label: 'Longsaddle',
						lat: -45.65625,
						lng: 182.75,
						type: 'place',
					},
					{
						label: 'Triboar',
						lat: -58.03125,
						lng: 189,
						type: 'place',
					},
					{
						label: 'Settlestone',
						lat: -33.125,
						lng: 211.40625,
						type: 'place',
					},
					{
						label: 'Mithral Hall',
						lat: -31.40625,
						lng: 212.75,
						type: 'place',
					},
					{
						label: 'Menzoberranzan',
						lat: -32.21875,
						lng: 215.53125,
						type: 'place',
					},
					{
						label: 'One Stone',
						lat: -30.8125,
						lng: 223.84375,
						type: 'place',
					},
					{
						label: "Beorunna's Well",
						lat: -21.21875,
						lng: 226.75,
						type: 'place',
					},
					{
						label: 'Citadel Felbarr',
						lat: -30.28125,
						lng: 235.9375,
						type: 'place',
					},
					{
						label: 'Sundabar',
						lat: -38.625,
						lng: 239.71875,
						type: 'place',
					},
					{
						label: 'Stone Stand',
						lat: -44.5625,
						lng: 237.4375,
						type: 'place',
					},
					{
						label: 'Silverymoon',
						lat: -39.8125,
						lng: 223.0625,
						type: 'place',
					},
					{
						label: 'Flint Rock',
						lat: -51.28125,
						lng: 197.28125,
						type: 'place',
					},
					{
						label: 'Yartar',
						lat: -58.6875,
						lng: 196.40625,
						type: 'place',
					},
					{
						label: 'Grandfather Tree',
						lat: -55.5,
						lng: 225.3125,
						type: 'place',
					},
					{
						label: 'Karse',
						lat: -66.46875,
						lng: 232.25,
						type: 'place',
					},
					{
						label: 'Thornhold',
						lat: -84.1875,
						lng: 170.4375,
						type: 'place',
					},
					{
						label: 'Amphail',
						lat: -88.375,
						lng: 181.6875,
						type: 'place',
					},
					{
						label: 'Waterdeep',
						lat: -96.625,
						lng: 183.125,
						type: 'place',
					},
					{
						label: 'Daggerford',
						lat: -103.03125,
						lng: 191.3125,
						type: 'place',
					},
					{
						label: 'Secomber',
						lat: -95.375,
						lng: 211.59375,
						type: 'place',
					},
					{
						label: 'Orogoth',
						lat: -109.40625,
						lng: 233.71875,
						type: 'place',
					},
					{
						label: "Warlock's Crypt",
						lat: -133.40625,
						lng: 199.9375,
						type: 'place',
					},
					{
						label: 'Dragonspear Castle',
						lat: -129.65625,
						lng: 214.96875,
						type: 'place',
					},
					{
						label: "Ss'thar'tiss'ssun",
						lat: -127.84375,
						lng: 253.4375,
						type: 'place',
					},
					{
						label: 'Boareskyr Bridge',
						lat: -143.0625,
						lng: 234.0625,
						type: 'place',
					},
					{
						label: 'Trollclaw Ford',
						lat: -144.0625,
						lng: 218.34375,
						type: 'place',
					},
					{
						label: 'Scornubel',
						lat: -163.40625,
						lng: 255.3125,
						type: 'place',
					},
					{
						label: 'Triel',
						lat: -158.3125,
						lng: 247.375,
						type: 'place',
					},
					{
						label: 'Elturel',
						lat: -160.875,
						lng: 229.6875,
						type: 'place',
					},
					{
						label: 'Fort Morninglord',
						lat: -163.6875,
						lng: 223.46875,
						type: 'place',
					},
					{
						label: "Baldur's Gate",
						lat: -167.34375,
						lng: 210.40625,
						type: 'place',
					},
					{
						label: 'Candlekeep',
						lat: -188.8125,
						lng: 203.125,
						type: 'place',
					},
				],
			},
			combat_encounters: {
				name: 'Combat Encounters',
				items: [
					{
						label: 'Bone wraiths encounter',
						lat: -209.375,
						lng: 116.875,
						type: 'place',
						mapLink: 'bone_wraiths_01',
					},
				],
			},
		},
		paths: WORLD_MAP_PATHS,
		submaps: {
			islands: {
				korinis_island: KORINIS_ISLAND,
				final_location: {
					metadata: {
						path: 'maps/world_maps/final_location/beach_landing',
						mapId: 'final_location_beach_landing',
						sizes: {
							maxZoom: 5,
							imageWidth: 6144,
							imageHeight: 4128,
						},
					},
					annotations: {
						navigation: {
							name: 'Navigation',
							items: [
								{
									label: 'Korinis Island',
									lat: -91.4375,
									lng: 89.75,
									type: 'icon',
									mapLink: 'korinis_island',
									map: {
										exitCoordinates: [-44, 581],
										exitZoom: 4,
									},
								},
							],
						},
					},
				},
				unnamed_island_01: UNNAMED_ISLAND,
			},
			combat_encounters: {
				bone_wraiths_encounter_01: {
					metadata: {
						path: 'maps/encounters/world_map/bone_wraiths_encounter_01',
						mapId: 'bone_wraiths_01',
						sizes: {
							maxZoom: 3,
							imageWidth: 6144,
							imageHeight: 3072,
						},
					},
					annotations: {
						points_of_interest: {
							name: 'Points of Interest',
							items: [
								{
									label: 'Back to world map',
									lat: -364,
									lng: 36,
									type: 'text',
									fontSize: 15,
									mapLink: 'world_maps',
								},
							],
						},
					},
				},
			},
		},
	},
};
