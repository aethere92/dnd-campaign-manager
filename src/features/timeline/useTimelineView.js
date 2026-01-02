import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTimeline } from '@/features/timeline/api/timelineService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getEventStyle } from './utils/eventStyles';

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
			// Events are already sorted by the SQL View
			const events = (session.events || []).map((event) => {
				return {
					id: event.id,
					title: event.title,
					typeLabel: event.type?.replace(/_/g, ' ') || 'Event',
					description: event.description,
					// View returns 'tags' directly with { name, type }
					tags: event.tags || [],
					style: getEventStyle(event.type),
				};
			});

			return {
				id: session.session_id,
				number: session.session_number ?? 999,
				dateLabel: session.session_date || 'Unknown Date',
				title: session.session_title,
				events,
			};
		});
	}, [data]);

	return { sessions, isLoading };
}
