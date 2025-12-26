import { Map, History, Network, BookOpen, Users, Scroll, Sword, Shield, Home } from 'lucide-react';

export const NAV_STRUCTURE = [
	{
		title: 'Overview',
		items: [{ label: 'Dashboard', Icon: Home, path: '/', key: 'dashboard' }], // NEW
	},
	{
		title: 'World',
		items: [
			{ label: 'Atlas', Icon: Map, path: '/atlas', key: 'atlas' },
			{ label: 'Timeline', Icon: History, path: '/timeline', key: 'timeline' },
			{ label: 'Graph', Icon: Network, path: '/relationships', key: 'graph' },
		],
	},
	{
		title: 'Wiki',
		items: [
			{ label: 'Sessions', Icon: BookOpen, path: '/wiki/session', key: 'session' },
			{ label: 'Characters', Icon: Users, path: '/wiki/character', key: 'character' },
			{ label: 'NPCs', Icon: Users, path: '/wiki/npc', key: 'npc' },
			{ label: 'Locations', Icon: Map, path: '/wiki/location', key: 'location' },
			{ label: 'Factions', Icon: Shield, path: '/wiki/faction', key: 'faction' },
			{ label: 'Quests', Icon: Scroll, path: '/wiki/quest', key: 'quest' },
			{ label: 'Encounters', Icon: Sword, path: '/wiki/encounter', key: 'encounter' },
		],
	},
];
