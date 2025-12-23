import { getAttributeValue, parseAttributes } from '../../../utils/entity/attributeParser';

const extractSessionMeta = (session, attributes = []) => {
	let attrs = attributes;
	if (Array.isArray(attrs)) {
		attrs = attrs.reduce((acc, curr) => {
			acc[curr.name] = curr.value;
			return acc;
		}, {});
	}
	attrs = attrs || {};

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

		// Attach relationships to events (passed from service)
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
		entity.objectives = additionalData.objectives;
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
