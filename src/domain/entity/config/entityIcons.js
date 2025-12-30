import {
	User,
	MapPin,
	Scroll,
	Sword,
	Flag,
	Crown,
	BookOpen,
	Calendar,
	Trees,
	Castle,
	Ship,
	Landmark,
	Globe,
	Home,
	Mountain,
} from 'lucide-react';
import { ENTITY_TYPES } from './entityTypes';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

export const ENTITY_ICONS = {
	[ENTITY_TYPES.SESSION]: Calendar,
	[ENTITY_TYPES.CHARACTER]: User,
	[ENTITY_TYPES.NPC]: Crown,
	[ENTITY_TYPES.LOCATION]: MapPin,
	[ENTITY_TYPES.QUEST]: Scroll,
	[ENTITY_TYPES.FACTION]: Flag,
	[ENTITY_TYPES.ENCOUNTER]: Sword,
	[ENTITY_TYPES.DEFAULT]: BookOpen,
};

// Location specific mappings
const LOCATION_TYPE_ICONS = {
	building: Home,
	ship: Ship,
	landmark: Landmark,
	dungeon: Mountain,
	cave: Mountain,
	region: MapPin,
	city: Castle,
	forest: Trees,
	realm: Globe,
};

export const getEntityIcon = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	return ENTITY_ICONS[normalized] || ENTITY_ICONS[ENTITY_TYPES.DEFAULT];
};

/**
 * Advanced resolution that looks at attributes for finer detail
 */
export const resolveEntityIcon = (entity) => {
	const type = entity.type?.toLowerCase();

	if (type === 'location') {
		const locType = getAttributeValue(entity.attributes, 'type')?.toLowerCase();
		return LOCATION_TYPE_ICONS[locType] || ENTITY_ICONS.location;
	}

	return getEntityIcon(type);
};
