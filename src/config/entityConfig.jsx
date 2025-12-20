import { User, MapPin, Scroll, Sword, Flag, Crown, BookOpen, Skull, Tent, MessageSquare, Calendar } from 'lucide-react';

export const ENTITY_CONFIG = {
	session: {
		label: 'Session',
		icon: Calendar,
		color: '#64748b', // slate-500
		tailwind: {
			text: 'text-slate-700',
			bg: 'bg-slate-50',
			border: 'border-slate-500',
			hover: 'hover:bg-slate-100',
		},
	},
	character: {
		label: 'Character',
		icon: User,
		color: '#ef4444', // red-500
		tailwind: {
			text: 'text-red-700',
			bg: 'bg-red-50',
			border: 'border-red-500',
			hover: 'hover:bg-red-50',
		},
	},
	npc: {
		label: 'NPC',
		icon: Crown,
		color: '#d97706', // amber-600
		tailwind: {
			text: 'text-amber-700',
			bg: 'bg-amber-50',
			border: 'border-amber-500',
			hover: 'hover:bg-amber-50',
		},
	},
	location: {
		label: 'Location',
		icon: MapPin,
		color: '#10b981', // emerald-500
		tailwind: {
			text: 'text-emerald-700',
			bg: 'bg-emerald-50',
			border: 'border-emerald-500',
			hover: 'hover:bg-emerald-50',
		},
	},
	quest: {
		label: 'Quest',
		icon: Scroll,
		color: '#3b82f6', // blue-500
		tailwind: {
			text: 'text-blue-700',
			bg: 'bg-blue-50',
			border: 'border-blue-500',
			hover: 'hover:bg-blue-50',
		},
	},
	faction: {
		label: 'Faction',
		icon: Flag,
		color: '#a855f7', // purple-500
		tailwind: {
			text: 'text-purple-700',
			bg: 'bg-purple-50',
			border: 'border-purple-500',
			hover: 'hover:bg-purple-50',
		},
	},
	encounter: {
		label: 'Encounter',
		icon: Sword,
		color: '#f97316', // orange-500
		tailwind: {
			text: 'text-orange-700',
			bg: 'bg-orange-50',
			border: 'border-orange-500',
			hover: 'hover:bg-orange-50',
		},
	},
	default: {
		label: 'Entity',
		icon: BookOpen,
		color: '#6b7280', // gray-500
		tailwind: {
			text: 'text-gray-700',
			bg: 'bg-muted',
			border: 'border-gray-400',
			hover: 'hover:bg-gray-100',
		},
	},
};

export const getEntityConfig = (type) => {
	const key = type?.toLowerCase().trim() || 'default';
	return ENTITY_CONFIG[key] || ENTITY_CONFIG.default;
};
