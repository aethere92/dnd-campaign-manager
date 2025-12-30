import { getEntityStyles } from '@/domain/entity/config/entityStyles';
import {
	Sword,
	Skull,
	MessageSquare,
	Scroll,
	CheckCircle2,
	Footprints,
	Map,
	MapPin,
	User,
	Flag,
	Search,
	BookOpen,
	Sparkles,
	Eye,
	ShoppingBag,
	Star,
	Tent,
} from 'lucide-react';

export const getEventStyle = (eventType) => {
	const type = eventType?.toLowerCase() || '';

	let entityType = 'default';
	let Icon = Star;

	switch (type) {
		case 'combat':
			entityType = 'encounter'; // Orange
			Icon = Skull;
			break;
		case 'social':
			entityType = 'npc'; // Amber
			Icon = MessageSquare;
			break;
		case 'quest_started':
			entityType = 'quest'; // Blue
			Icon = Scroll;
			break;
		case 'quest_progressed':
			entityType = 'quest'; // Blue
			Icon = CheckCircle2;
			break;
		case 'travel':
			entityType = 'location'; // Emerald
			Icon = Footprints; // Journeys
			break;
		case 'location_discovered':
			entityType = 'location'; // Emerald
			Icon = Map; // Finding new places
			break;
		case 'location_visited':
			entityType = 'location'; // Emerald
			Icon = MapPin; // Arriving at known places
			break;
		case 'npc_encountered':
			entityType = 'npc'; // Amber
			Icon = User;
			break;
		case 'faction_discovered':
			entityType = 'faction'; // Purple
			Icon = Flag;
			break;
		case 'investigation':
			entityType = 'default'; // Gray (Neutral/Mechanics)
			Icon = Search;
			break;
		case 'backstory':
			entityType = 'character'; // Red (Personal)
			Icon = BookOpen;
			break;
		case 'discovery':
			entityType = 'encounter'; // Orange (Loot/Items/Secrets)
			Icon = Sparkles;
			break;
		case 'vision':
			entityType = 'faction'; // Purple (Magic/Mystical)
			Icon = Eye;
			break;
		case 'shopping':
			entityType = 'npc'; // Amber (Trade/Commerce)
			Icon = ShoppingBag;
			break;
		case 'special_event':
			entityType = 'session'; // Slate (Meta/Unique)
			Icon = Star;
			break;
		// Fallbacks for legacy types or fuzzy matches
		default:
			if (type.match(/combat|fight|kill/)) {
				entityType = 'encounter';
				Icon = Sword;
			} else if (type.match(/npc|social|meet/)) {
				entityType = 'npc';
				Icon = MessageSquare;
			} else if (type.match(/location|visit|arrive/)) {
				entityType = 'location';
				Icon = MapPin;
			} else if (type.match(/quest|mission/)) {
				entityType = 'quest';
				Icon = Scroll;
			} else if (type.match(/camp|rest/)) {
				entityType = 'location';
				Icon = Tent;
			} else {
				entityType = 'default';
				Icon = Star;
			}
	}

	// Use centralized styles
	const styles = getEntityStyles(entityType);

	return {
		Icon,
		// Map standard styles to timeline specific class structure
		container: `${styles.border} ${styles.bg} ${styles.text}`,
		// Heuristic for line color (usually 200 or 300 shade) based on bg class
		line: styles.bg.replace('-50', '-200'),
	};
};
