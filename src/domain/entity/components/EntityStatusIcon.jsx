import { clsx } from 'clsx';
import { getStatusIcon } from '@/domain/entity/utils/statusUtils';

/**
 * EntityStatusIcon Component
 * Smart status indicator based on entity type and status/affinity
 *
 * @param {Object} entity - Entity object with type and status/affinity
 * @param {number} size - Icon size (default 12)
 * @param {string} className - Additional CSS classes
 */
export default function EntityStatusIcon({ entity, size = 12, className = '', ...props }) {
	if (!entity) return null;

	// Determine which status to show (affinity takes priority for NPCs/factions)
	const statusValue = entity.affinity || entity.status;
	if (!statusValue || statusValue === 'unknown') return null;

	const { Icon, className: statusClass } = getStatusIcon(statusValue, entity.type);

	return <Icon size={size} className={clsx(statusClass, className)} strokeWidth={2.5} {...props} />;
}

/**
 * EntityStatusBadge Component
 * Status indicator with text label
 *
 * @param {Object} entity - Entity object
 * @param {string} className - Additional CSS classes
 */
export function EntityStatusBadge({ entity, className = '', ...props }) {
	if (!entity) return null;

	const statusValue = entity.affinity || entity.status;
	if (!statusValue || statusValue === 'unknown') return null;

	const { Icon, className: statusClass } = getStatusIcon(statusValue, entity.type);

	return (
		<span
			className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md border', className)}
			{...props}>
			<Icon size={12} className={statusClass} strokeWidth={2.5} />
			<span className='capitalize'>{statusValue}</span>
		</span>
	);
}
