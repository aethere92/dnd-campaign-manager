import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getEntities, getCampaignArcs } from '@/domain/entity/api/entityService';
import { supabase } from '@/shared/api/supabaseClient'; // Import Supabase directly
import { useMemo } from 'react';

export function useEntityFetching(type) {
	const { campaignId } = useCampaign();
	const normalizedType = type === 'sessions' ? 'session' : type;

	// 1. Primary Query
	const mainQuery = useQuery({
		queryKey: ['entities', campaignId, normalizedType],
		queryFn: async () => {
			// FIX: If fetching sessions, query the sessions table directly
			// to ensure we get the 'narrative' (mapped to description)
			if (normalizedType === 'session') {
				const { data, error } = await supabase
					.from('sessions')
					.select('id, title, narrative, attributes, created_at')
					.eq('campaign_id', campaignId);

				if (error) throw error;

				// Normalize to Entity shape
				return data.map((s) => ({
					id: s.id,
					type: 'session',
					name: s.title,
					description: s.narrative, // Map narrative to description
					attributes: s.attributes,
					created_at: s.created_at,
				}));
			}

			// Otherwise use the standard service
			return getEntities(campaignId, normalizedType);
		},
		enabled: !!campaignId && !!normalizedType,
		staleTime: 1000 * 60 * 5,
	});

	// 2. Locations (for hierarchy)
	const needsLocations = normalizedType === 'npc' || normalizedType === 'encounter';
	const locationQuery = useQuery({
		queryKey: ['entities', campaignId, 'location'],
		queryFn: () => getEntities(campaignId, 'location'),
		enabled: !!campaignId && needsLocations,
		staleTime: 1000 * 60 * 5,
	});

	// 3. Narrative Arcs
	const needsArcs = normalizedType === 'session';
	const arcQuery = useQuery({
		queryKey: ['entities', campaignId, 'narrative_arc_context'],
		queryFn: () => getCampaignArcs(campaignId),
		enabled: !!campaignId && needsArcs,
		staleTime: 1000 * 60 * 5,
	});

	// 4. Merge
	const { entities, context } = useMemo(() => {
		if (mainQuery.isLoading) return { entities: [], context: {} };

		let data = mainQuery.data || [];

		if (needsLocations && locationQuery.data) {
			const existingIds = new Set(data.map((e) => e.id));
			const newLocations = locationQuery.data.filter((l) => !existingIds.has(l.id));
			data = [...data, ...newLocations];
		}

		const context = {};
		if (needsArcs && arcQuery.data) {
			context.arcs = arcQuery.data.arcs;
			const sessionArcMap = new Map();
			(arcQuery.data.rels || []).forEach((r) => {
				sessionArcMap.set(r.from_entity_id, r.to_entity_id);
			});
			context.sessionArcMap = sessionArcMap;
		}

		return { entities: data, context };
	}, [mainQuery.data, locationQuery.data, arcQuery.data, needsLocations, needsArcs, mainQuery.isLoading]);

	return {
		entities,
		context,
		isLoading: mainQuery.isLoading || (needsLocations && locationQuery.isLoading) || (needsArcs && arcQuery.isLoading),
		error: mainQuery.error || locationQuery.error,
	};
}
