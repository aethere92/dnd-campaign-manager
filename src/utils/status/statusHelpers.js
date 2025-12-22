import { Sword, Shield, Circle, HelpCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getAttributeValue } from '../entity/attributeParser';

/**
 * Rank definitions for sorting.
 * Lower number = Higher priority in lists.
 */
const AFFINITY_RANKS = {
	// Rank 1: Allies
	ally: 1,
	allies: 1,
	friend: 1,
	friendly: 1,
	helpful: 1,
	allied: 1,
	alliance: 1,
	aligned: 1,
	// Rank 2: Neutral
	neutral: 2,
	indifferent: 2,
	unknown: 2, // 'Unknown' faction status often implies neutral
	// Rank 3: Enemies
	enemy: 3,
	enemies: 3,
	hostile: 3,
	rival: 3,
	villain: 3,
	threat: 3,
	// Rank 99: Fallback
	other: 99,
};

/**
 * Calculate a numeric rank for an entity based on status/affinity string.
 * Used for sorting: Allies -> Neutral -> Enemies -> Unknown
 *
 * @param {string} statusOrAffinity
 * @returns {number} 1, 2, 3, or 99
 */
export const getAffinityRank = (statusOrAffinity) => {
	const key = (statusOrAffinity || '').toLowerCase();

	// Check for exact matches or substring matches
	for (const [term, rank] of Object.entries(AFFINITY_RANKS)) {
		if (key.includes(term)) return rank;
	}

	return 99;
};

/**
 * Get status icon based on entity type and status
 */
export const getStatusIcon = (status, type) => {
	const s = status?.toLowerCase() || 'unknown';

	// Quest-specific icons
	if (type === 'quest') {
		if (['active', 'in progress', 'started'].some((k) => s.includes(k))) {
			return { Icon: Circle, className: 'text-amber-500 fill-amber-500/20' };
		}
		if (['completed', 'finished', 'done', 'success'].some((k) => s.includes(k))) {
			return { Icon: CheckCircle2, className: 'text-emerald-600' };
		}
		if (['failed', 'failure'].some((k) => s.includes(k))) {
			return { Icon: XCircle, className: 'text-red-500' };
		}
		if (['abandoned', 'on-hold', 'paused'].some((k) => s.includes(k))) {
			return { Icon: Clock, className: 'text-slate-400' };
		}
		return { Icon: Circle, className: 'text-slate-300' };
	}

	// NPC/Faction affinity icons
	const rank = getAffinityRank(s);

	if (rank === 3) {
		// Enemy
		return { Icon: Sword, className: 'text-red-500 fill-red-500/10' };
	}
	if (rank === 1) {
		// Ally
		return { Icon: Shield, className: 'text-emerald-500 fill-emerald-500/10' };
	}
	// Neutral / Unknown
	return { Icon: Circle, className: 'text-gray-400' };
};

export const getStatusInfo = (entity) => {
	const statusRaw = entity.status || getAttributeValue(entity.attributes, ['status']);
	const affinityRaw = getAttributeValue(entity.attributes, ['affinity']);

	const displayStatus = affinityRaw && affinityRaw !== 'unknown' ? affinityRaw : statusRaw;
	const statusLower = displayStatus?.toLowerCase();

	return {
		raw: statusRaw,
		display: displayStatus,
		icon: getStatusIcon(displayStatus, entity.type),
		rank: getAffinityRank(displayStatus),
		isDead: statusLower === 'dead',
		isFailed: statusLower === 'failed',
		isCompleted: ['completed', 'finished', 'done', 'success'].some((k) => statusLower?.includes(k)),
	};
};
