import { getAttributeValue, parseAttributes } from '@/domain/entity/utils/attributeParser'; // Imported here
import { resolveImageUrl } from '@/shared/utils/imageUtils';

const extractSessionMeta = (session, attributes = []) => {
	// REUSE: Use our upgraded utility instead of manual reduce
	const attrs = parseAttributes(attributes);

	const sessionNumber = getAttributeValue(attrs, ['session_number', 'Session', 'session']) || 999;
	const sessionDate = getAttributeValue(attrs, ['session_date', 'Date', 'date']) || '';

	return {
		...session,
		session_number: Number(sessionNumber),
		session_date: sessionDate,
		attributes: attrs,
	};
};

export const transformWikiEntry = (data, type, additionalData = {}) => {
	if (type === 'session') {
		const meta = extractSessionMeta(data, additionalData.attributes || []);
		const sortedEvents = (data.events || []).sort((a, b) => (a.event_order || 0) - (b.event_order || 0));

		const eventRelMap = additionalData.eventRelMap || new Map();
		sortedEvents.forEach((evt) => {
			evt.relationships = eventRelMap.get(evt.id) || [];
		});

		return {
			id: data.id,
			name: data.title,
			type: 'session',
			description: getAttributeValue(meta.attributes, 'Summary') || data.narrative,
			attributes: {
				...meta.attributes,
				Session: meta.session_number,
				Date: meta.session_date,
			},
			relationships: additionalData.sessionRelationships || [],
			events: sortedEvents || [],
		};
	}

	// Standard Entity Transformation
	let entity = { ...data };

	// Quest Objectives
	if (type === 'quest' && additionalData.objectives) {
		entity.objectives = additionalData.objectives.map((obj) => ({
			...obj,
			completed_session_number: obj.session?.session_number || null,
			completed_session_title: obj.session?.title || null,
		}));
	}

	// NEW: Encounter Actions Transformation
	if (type === 'encounter' && additionalData.encounterActions) {
		const actions = additionalData.encounterActions.map((action) => {
			// 1. Resolve Actor Icon
			const actorAttrs = parseAttributes(action.actor?.attributes);
			const actorIcon = resolveImageUrl(actorAttrs, 'icon');

			// 2. Resolve Target Icon (NEW)
			const targetAttrs = parseAttributes(action.target?.attributes);
			const targetIcon = resolveImageUrl(targetAttrs, 'icon');

			const targetName = action.target_name || action.target?.name;
			const targetId = action.target?.id;
			const targetType = action.target?.type || 'default';

			return {
				id: action.id,
				round: action.round_number,
				order: action.action_order,
				type: action.action_type,
				isFriendly: action.is_friendly,
				description: action.action_description,
				result: action.result,
				effect: action.effect,
				actor: {
					id: action.actor?.id,
					name: action.actor_name || action.actor?.name || 'Unknown',
					type: action.actor?.type || 'default',
					iconUrl: actorIcon, // Pass Resolved Icon
				},
				target: targetName
					? {
							id: targetId,
							name: targetName,
							type: targetType,
							iconUrl: targetIcon, // Pass Resolved Icon
					  }
					: null,
			};
		});

		// ... grouping logic
		const rounds = {};
		actions.forEach((action) => {
			if (!rounds[action.round]) rounds[action.round] = [];
			rounds[action.round].push(action);
		});

		entity.combatRounds = rounds;
	}

	// Event Processing
	let events = entity.events;
	if (events && typeof events === 'object' && !Array.isArray(events)) {
		events = Object.values(events).flat();
	}

	if (events && Array.isArray(events) && events.length > 0 && additionalData.sessionMap) {
		events = events.map((event) => ({
			...event,
			session_number:
				event.session_id && additionalData.sessionMap.has(event.session_id)
					? additionalData.sessionMap.get(event.session_id) - 1
					: null,
		}));

		events.sort((a, b) => {
			if (a.session_number !== b.session_number) {
				if (a.session_number == null) return 1;
				if (b.session_number == null) return -1;
				return a.session_number - b.session_number;
			}
			return (a.order || 0) - (b.order || 0);
		});
		entity.events = events;
	}

	return entity;
};
