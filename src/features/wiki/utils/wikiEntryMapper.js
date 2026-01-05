// features/wiki/utils/wikiEntryMapper.js
import { resolveImageUrl } from '@/shared/utils/imageUtils';

export const transformWikiEntry = (data, type, additionalData = {}) => {
	// --- SESSION ---
	if (type === 'session') {
		// Data comes from view_campaign_timeline
		const sortedEvents = (data.events || []).sort((a, b) => (a.order || 0) - (b.order || 0));

		const eventRelMap = additionalData.eventRelMap || new Map();

		// 1. Attach tags to specific events
		sortedEvents.forEach((evt) => {
			evt.relationships = eventRelMap.get(evt.id) || [];
		});

		// 2. Aggregate ALL unique entities from events to show in the Session Graph
		const allRelationships = [...(additionalData.sessionRelationships || [])];
		const seenIds = new Set(allRelationships.map((r) => r.entity_id));

		// Iterate all events and their tags
		eventRelMap.forEach((tags) => {
			tags.forEach((tag) => {
				if (!seenIds.has(tag.entity_id)) {
					seenIds.add(tag.entity_id);
					allRelationships.push({
						entity_id: tag.entity_id,
						entity_name: tag.entity_name,
						entity_type: tag.entity_type,
						type: 'mention', // Label for the edge
					});
				}
			});
		});

		return {
			id: data.id,
			name: data.name || data.title,
			type: 'session',
			description: data.description || data.narrative,
			attributes: data.attributes || {},
			relationships: allRelationships, // Now includes event mentions
			events: sortedEvents,
		};
	}

	// --- STANDARD ENTITY ---
	let entity = { ...data };

	// Quest Objectives
	if (type === 'quest' && additionalData.objectives) {
		entity.objectives = additionalData.objectives.map((obj) => {
			const sessionAttrs = obj.session?.attributes || {};
			return {
				...obj,
				completed_session_number: sessionAttrs.session_number,
				completed_session_title: obj.session?.title,
			};
		});
	}

	// Encounter Actions
	if (type === 'encounter' && additionalData.encounterActions) {
		const actions = additionalData.encounterActions.map((action) => {
			const actorAttrs = action.actor?.attributes || {};
			const targetAttrs = action.target?.attributes || {};

			return {
				id: action.id,
				round: action.round_number,
				order: action.action_order,
				type: action.action_type,
				isFriendly: action.result === 'SUCCESS',
				description: action.action_description,
				result: action.result,
				effect: action.effect,
				actor: {
					id: action.actor?.id,
					name: action.actor?.name || 'Unknown',
					type: action.actor?.type || 'default',
					iconUrl: resolveImageUrl(actorAttrs, 'icon'),
				},
				target: action.target?.id
					? {
							id: action.target.id,
							name: action.target.name,
							type: action.target.type,
							iconUrl: resolveImageUrl(targetAttrs, 'icon'),
					  }
					: null,
			};
		});

		const rounds = {};
		actions.forEach((action) => {
			if (!rounds[action.round]) rounds[action.round] = [];
			rounds[action.round].push(action);
		});

		entity.combatRounds = rounds;
	}

	// Event Session Mapping
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
