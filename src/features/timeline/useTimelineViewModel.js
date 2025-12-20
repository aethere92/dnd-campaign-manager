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

	const sessions = (data || []).map((session) => {
		// Sort events safely
		const sortedEvents = (session.events || []).sort((a, b) => a.event_order - b.event_order);

		// Map events to View Model
		const events = sortedEvents.map((event) => ({
			id: event.id,
			title: event.title,
			typeLabel: event.event_type?.replace(/_/g, ' ') || 'Event',
			description: event.description,
			location: event.location ? { name: event.location.name } : null,
			npc: event.npc ? { name: event.npc.name } : null,
			style: getEventStyle(event.event_type),
		}));

		return {
			id: session.id,
			number: session.session_number,
			dateLabel: session.session_date || 'Unknown Date',
			title: session.title,
			events,
		};
	});

	return { sessions, isLoading };
}
