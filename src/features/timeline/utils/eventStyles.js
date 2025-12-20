import { Calendar, MapPin, User, Sword, Scroll, Flag, MessageSquare, Skull, Crown, Tent } from 'lucide-react';

/**
 * Determines the visual style of an event based on its type string.
 * @param {string} eventType
 * @returns {import('../types').EventStyle}
 */
export const getEventStyle = (eventType) => {
	const type = eventType?.toLowerCase() || '';

	// 1. COMBAT (Red)
	if (type.match(/combat|fight|kill/)) {
		return {
			Icon: Sword,
			container: 'border-red-500 bg-red-50 text-red-600',
			line: 'bg-red-200',
		};
	}

	// 2. DANGER/ENCOUNTER (Orange)
	if (type.includes('encounter')) {
		return {
			Icon: Skull,
			container: 'border-orange-500 bg-orange-50 text-orange-600',
			line: 'bg-orange-200',
		};
	}

	// 3. SOCIAL (Amber)
	if (type.match(/npc|social|meet/)) {
		return {
			Icon: User,
			container: 'border-amber-500 bg-amber-50 text-amber-600',
			line: 'bg-amber-200',
		};
	}

	// 4. TRAVEL (Emerald)
	if (type.match(/location|travel|visit|arrive/)) {
		return {
			Icon: MapPin,
			container: 'border-emerald-500 bg-emerald-50 text-emerald-600',
			line: 'bg-emerald-200',
		};
	}

	// 5. REST (Emerald/Green)
	if (type.match(/camp|rest/)) {
		return {
			Icon: Tent,
			container: 'border-emerald-600 bg-emerald-100 text-emerald-700',
			line: 'bg-emerald-300',
		};
	}

	// 6. QUESTS (Blue)
	if (type.match(/quest|mission/)) {
		return {
			Icon: Scroll,
			container: 'border-blue-500 bg-blue-50 text-blue-600',
			line: 'bg-blue-200',
		};
	}

	// 7. FACTIONS (Purple)
	if (type.includes('faction')) {
		return {
			Icon: Flag,
			container: 'border-purple-500 bg-purple-50 text-purple-600',
			line: 'bg-purple-200',
		};
	}

	// Default
	return {
		Icon: MessageSquare,
		container: 'border-gray-400 bg-muted text-gray-500',
		line: 'bg-gray-200',
	};
};
