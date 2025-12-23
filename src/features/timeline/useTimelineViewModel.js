import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTimeline } from '../../services/timeline'; // Adjust path based on your root
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { getEventStyle } from './utils/eventStyles';
import './types';

/**
 * @returns {{ sessions: import('./types').TimelineSessionModel[], isLoading: boolean }}
 */
export function useTimelineViewModel() {
	const { campaignId } = useCampaign();

	const { data, isLoading } = useQuery({
		queryKey: ['timeline', campaignId],
		queryFn: () => getTimeline(campaignId),
		enabled: !!campaignId,
	});

	const sessions = useMemo(() => {
		return (data || []).map((session) => {
			// Sort events safely: Use spread to avoid mutating read-only cache, handle nulls
			const sortedEvents = [...(session.events || [])].sort((a, b) => (a.event_order || 0) - (b.event_order || 0));

			// Map events to View Model
			const events = sortedEvents.map((event) => {
				// TRANSFORMATION: Convert relationships to tags
				const tags = (event.relationships || [])
					.map((rel) => {
						if (!rel.target) return null;
						return {
							name: rel.target.name,
							type: rel.target.type?.toLowerCase() || 'default',
						};
					})
					.filter(Boolean); // Remove nulls

				return {
					id: event.id,
					title: event.title,
					typeLabel: event.event_type?.replace(/_/g, ' ') || 'Event',
					description: event.description,
					tags, // New property containing all connected entities
					style: getEventStyle(event.event_type),
				};
			});

			return {
				id: session.id,
				number: session.session_number,
				dateLabel: session.session_date || 'Unknown Date',
				title: session.title,
				events,
			};
		});
	}, [data]);

	return { sessions, isLoading };
}
