import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTimeline } from '@/features/timeline/api/timelineService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getEventStyle } from './utils/eventStyles';

export function useTimelineViewModel() {
	const { campaignId } = useCampaign();
	const [searchQuery, setSearchQuery] = useState('');
	const [collapsedSessions, setCollapsedSessions] = useState(new Set());

	const { data, isLoading } = useQuery({
		queryKey: ['timeline', campaignId],
		queryFn: () => getTimeline(campaignId),
		enabled: !!campaignId,
	});

	// --- Actions ---

	const toggleSession = useCallback((sessionId) => {
		setCollapsedSessions((prev) => {
			const next = new Set(prev);
			if (next.has(sessionId)) {
				next.delete(sessionId);
			} else {
				next.add(sessionId);
			}
			return next;
		});
	}, []);

	const collapseAll = useCallback(() => {
		if (!data) return;
		const allIds = data.map((s) => s.session_id);
		setCollapsedSessions(new Set(allIds));
	}, [data]);

	const expandAll = useCallback(() => {
		setCollapsedSessions(new Set());
	}, []);

	// --- Filtering & Processing ---

	const timelineItems = useMemo(() => {
		if (!data) return [];

		const items = [];
		let currentArcId = null;

		// Normalize Search
		const query = searchQuery.toLowerCase().trim();
		const isSearching = query.length > 0;

		// Process each session from the DB
		data.forEach((session) => {
			// 1. Filter Logic
			let matchingEvents = [];
			const sessionMatches = session.session_title.toLowerCase().includes(query);

			// Map events to view model first
			const allEvents = (session.events || []).map((event) => ({
				id: event.id,
				title: event.title,
				typeLabel: event.type?.replace(/_/g, ' ') || 'Event',
				description: event.description,
				tags: event.tags || [],
				style: getEventStyle(event.type),
			}));

			if (isSearching) {
				if (sessionMatches) {
					// Match on Session Title -> Show all events
					matchingEvents = allEvents;
				} else {
					// Match on Event Content -> Show only matching events
					matchingEvents = allEvents.filter(
						(e) =>
							e.title.toLowerCase().includes(query) ||
							(e.description && e.description.toLowerCase().includes(query)) ||
							e.tags.some((t) => t.name.toLowerCase().includes(query))
					);
				}
			} else {
				matchingEvents = allEvents;
			}

			// If searching and nothing matches, skip this session entirely
			if (isSearching && !sessionMatches && matchingEvents.length === 0) {
				return;
			}

			// 2. Arc Logic (Only add Arc header if we are adding a session under it)
			if (session.arc_id && session.arc_id !== currentArcId) {
				items.push({
					type: 'arc_header',
					id: `arc-${session.arc_id}`,
					title: session.arc_title,
					description: session.arc_description,
					color: session.arc_attributes?.color || 'amber',
				});
				currentArcId = session.arc_id;
			} else if (!session.arc_id && currentArcId !== null) {
				currentArcId = null;
			}

			// 3. Determine Expansion State
			// If searching, always expand. Otherwise, check state.
			const isExpanded = isSearching ? true : !collapsedSessions.has(session.session_id);

			items.push({
				type: 'session',
				id: session.session_id,
				number: session.session_number ?? 999,
				dateLabel: session.session_date || 'Unknown Date',
				title: session.session_title,
				events: matchingEvents,
				synopsis: session?.attributes?.synopsis || null,
				isExpanded,
				hasActiveSearch: isSearching, // Pass this down to disable toggles during search if desired
			});
		});

		return items;
	}, [data, searchQuery, collapsedSessions]);

	return {
		timelineItems,
		isLoading,
		searchQuery,
		setSearchQuery,
		toggleSession,
		expandAll,
		collapseAll,
	};
}
