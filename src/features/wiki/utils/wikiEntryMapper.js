// features/wiki/utils/wikiEntryMapper.js
import { resolveImageUrl } from '@/shared/utils/imageUtils';

export const transformWikiEntry = (data, type, additionalData = {}) => {
	// --- SESSION ---
	if (type === 'session') {
		// Data comes from view_campaign_timeline, so structure is cleaner
		const sortedEvents = (data.events || []).sort((a, b) => (a.order || 0) - (b.order || 0));

		const eventRelMap = additionalData.eventRelMap || new Map();
		sortedEvents.forEach((evt) => {
			evt.relationships = eventRelMap.get(evt.id) || [];
		});

		return {
			id: data.id,
			name: data.name || data.title, // Handle both View (title) and potential Table (name) keys
			type: 'session',
			description: data.description || data.narrative,
			attributes: data.attributes || {},
			relationships: additionalData.sessionRelationships || [],
			events: sortedEvents,
		};
	}

	// --- STANDARD ENTITY ---
	let entity = { ...data };

	// Quest Objectives
	if (type === 'quest' && additionalData.objectives) {
		entity.objectives = additionalData.objectives.map((obj) => {
			// Handle JSONB session attributes
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
			// Data comes from view_encounter_actions_hydrated
			// actor and target are JSON objects with { id, name, type, attributes }

			const actorAttrs = action.actor?.attributes || {};
			const targetAttrs = action.target?.attributes || {};

			return {
				id: action.id,
				round: action.round_number,
				order: action.action_order,
				type: action.action_type,
				isFriendly: action.result === 'SUCCESS', // Fallback logic if is_friendly missing from view
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

		// Group by Round
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
					? additionalData.sessionMap.get(event.session_id) - 1 // 0-based index for calendar
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
