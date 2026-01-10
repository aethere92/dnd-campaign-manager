// features/atlas/api/mapService.js
import { supabase } from '@/shared/api/supabaseClient';

/**
 * Fetches a specific map by its URL key for the active campaign.
 * STRICT MODE: Only fetches from DB. No fallback to local files.
 */
export const fetchMapByKey = async (campaignId, mapKey) => {
	if (!campaignId || !mapKey) return null;

	const { data, error } = await supabase
		.from('maps')
		.select('*')
		.eq('campaign_id', campaignId)
		.eq('key', mapKey)
		.maybeSingle();

	if (error) {
		console.error('[Atlas] Error fetching map:', error);
		return null;
	}

	if (!data) {
		console.warn(`[Atlas] Map '${mapKey}' not found in database.`);
		return null;
	}

	// Merge config (metadata) and data (content) into a single View Model
	// This creates a unified structure for the frontend
	return {
		id: data.id,
		key: data.key,
		...data.config, // sizes, path, parentId, etc.
		...data.data, // markers, paths, areas, overlays
	};
};
