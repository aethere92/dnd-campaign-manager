import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTimeline } from '@/features/timeline/api/timelineService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getEventStyle } from './utils/eventStyles';

export function useTimelineViewModel() {
	const { campaignId } = useCampaign();

	const { data, isLoading } = useQuery({
		queryKey: ['timeline', campaignId],
		queryFn: () => getTimeline(campaignId),
		enabled: !!campaignId,
	});

	const timelineItems = useMemo(() => {
		if (!data) return [];

		const items = [];
		let currentArcId = null;

		data.forEach((session) => {
			// 1. Detect Arc Change
			// Use strict comparison to detect switching from one arc to another
			if (session.arc_id && session.arc_id !== currentArcId) {
				items.push({
					type: 'arc_header',
					id: `arc-${session.arc_id}`,
					title: session.arc_title,
					description: session.arc_description,
					color: session.arc_attributes?.color || 'amber', // Future proofing
				});
				currentArcId = session.arc_id;
			} else if (!session.arc_id && currentArcId !== null) {
				// Optional: We dropped out of an arc into "uncategorized"
				currentArcId = null;
			}

			// 2. Process Session (Existing Logic)
			const events = (session.events || []).map((event) => ({
				id: event.id,
				title: event.title,
				typeLabel: event.type?.replace(/_/g, ' ') || 'Event',
				description: event.description,
				tags: event.tags || [],
				style: getEventStyle(event.type),
			}));

			items.push({
				type: 'session',
				id: session.session_id,
				number: session.session_number ?? 999,
				dateLabel: session.session_date || 'Unknown Date',
				title: session.session_title,
				events,
			});
		});

		return items;
	}, [data]);

	return { timelineItems, isLoading };
}
