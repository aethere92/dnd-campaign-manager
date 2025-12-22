import { getStatusIcon } from '../../../../utils/status/statusHelpers';

/**
 * StatusIcon Component
 * Displays status/affinity icon for entities in sidebar
 *
 * @param {Object} entity - Entity with status/affinity
 */
export const StatusIcon = ({ entity }) => {
	// Prioritize affinity over status for NPCs/Factions
	const statusValue = entity.affinity && entity.affinity !== 'unknown' ? entity.affinity : entity.status;

	const { Icon, className } = getStatusIcon(statusValue, entity.type);

	return <Icon size={10} className={className} strokeWidth={2.5} />;
};
