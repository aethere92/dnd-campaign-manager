import { getEntityConfig, ENTITY_CONFIG, getEntityStyles } from '../../../config/entity';
import { MessageSquare, Tent, Skull } from 'lucide-react';

export const getEventStyle = (eventType) => {
	const type = eventType?.toLowerCase() || '';

	// Mapping logic using centralized config
	let entityType = 'default';
	let Icon = MessageSquare;

	// Resolve Type
	if (type.match(/combat|fight|kill/)) {
		entityType = 'character'; // Use red palette
		Icon = ENTITY_CONFIG.encounter.icon || Skull;
	} else if (type.includes('encounter')) {
		entityType = 'encounter';
		Icon = ENTITY_CONFIG.encounter.icon;
	} else if (type.match(/npc|social|meet/)) {
		entityType = 'npc';
		Icon = ENTITY_CONFIG.npc.icon;
	} else if (type.match(/location|travel|visit|arrive/)) {
		entityType = 'location';
		Icon = ENTITY_CONFIG.location.icon;
	} else if (type.match(/quest|mission/)) {
		entityType = 'quest';
		Icon = ENTITY_CONFIG.quest.icon;
	} else if (type.match(/camp|rest/)) {
		entityType = 'location'; // Reuse location or define new
		Icon = Tent;
	} else if (type.includes('faction')) {
		entityType = 'faction';
		Icon = ENTITY_CONFIG.faction.icon;
	}

	// Use centralized styles
	const styles = getEntityStyles(entityType);

	return {
		Icon,
		// Map standard styles to timeline specific class structure
		container: `${styles.border} ${styles.bg} ${styles.text}`,
		// Heuristic for line color (usually 200 or 300 shade)
		line: styles.bg.replace('-50', '-200'),
	};
};
