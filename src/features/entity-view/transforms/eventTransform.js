/**
 * Event Transform Functions
 * Pure functions for processing entity events/history into view model format
 */

/**
 * Parse events from various formats
 * @param {Array|Object} events - Raw events data
 * @returns {Array}
 */
export const parseEvents = (events) => {
	if (!events) return [];

	// Already an array
	if (Array.isArray(events)) {
		return events;
	}

	// Object grouped by type (flatten it)
	if (typeof events === 'object') {
		return Object.values(events).flat();
	}

	return [];
};

/**
 * Transform events into history view model
 * Includes deduplication to prevent React key errors
 * @param {Array|Object} events - Raw events
 * @returns {Array}
 */
export const transformEvents = (events) => {
	const parsed = parseEvents(events);

	// 1. Deduplicate by ID using a Map
	const uniqueEventsMap = new Map();
	parsed.forEach((evt) => {
		if (evt && evt.id) {
			uniqueEventsMap.set(evt.id, evt);
		} else if (evt) {
			// Handle events without IDs (fallback)
			uniqueEventsMap.set(Math.random().toString(), evt);
		}
	});

	// 2. Transform values
	return Array.from(uniqueEventsMap.values()).map((event) => ({
		id: event.id || Math.random().toString(),
		title: event.title || 'Untitled Event',
		description: event.description || '',
		session_number: event.session_number,
		order: event.order || event.event_order || 0,
	}));
};
