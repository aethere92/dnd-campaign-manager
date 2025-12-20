import { Map, History, Network, BookOpen, Users, Scroll, Sword, Shield } from 'lucide-react';

export const NAV_STRUCTURE = [
	{
		title: 'World',
		items: [
			{ label: 'Atlas', Icon: Map, path: '/' },
			{ label: 'Timeline', Icon: History, path: '/timeline' },
			{ label: 'Graph', Icon: Network, path: '/relationships' },
		],
	},
	{
		title: 'Wiki',
		items: [
			{ label: 'Sessions', Icon: BookOpen, path: '/wiki/session' },
			{ label: 'Characters', Icon: Users, path: '/wiki/character' },
			{ label: 'NPCs', Icon: Users, path: '/wiki/npc' },
			{ label: 'Locations', Icon: Map, path: '/wiki/location' },
			{ label: 'Factions', Icon: Shield, path: '/wiki/faction' },
			{ label: 'Quests', Icon: Scroll, path: '/wiki/quest' },
			{ label: 'Encounters', Icon: Sword, path: '/wiki/encounter' },
		],
	},
];
