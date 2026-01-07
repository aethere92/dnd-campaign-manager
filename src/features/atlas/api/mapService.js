import { supabase } from '@/shared/api/supabaseClient';

/**
 * Fetches a specific map by its URL key for the active campaign.
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
		console.error('[MapService] Error fetching map:', error);
		return null;
	}

	if (!data) return null;

	// Reconstruct the object structure
	return {
		// Merge 'config' (metadata + parentId) back to the root level
		// so the UI can find mapConfig.parentId if needed
		...data.config,
		metadata: data.config, // Keep a specific metadata key for compatibility

		// Spread the content data (annotations, paths, etc)
		...data.data,
	};
};

export const upsertMap = async (campaignId, mapKey, title, config, contentData) => {
	const payload = {
		campaign_id: campaignId,
		key: mapKey,
		title: title,
		config: config,
		data: contentData,
		updated_at: new Date(),
	};

	const { data, error } = await supabase
		.from('maps')
		.upsert(payload, { onConflict: 'campaign_id, key' })
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const fetchCampaignMaps = async (campaignId) => {
	const { data, error } = await supabase.from('maps').select('id, key, title').eq('campaign_id', campaignId);

	if (error) throw error;
	return data;
};

/**
 * Updates only the content data (markers, paths, etc) of a map.
 */
export const updateMapData = async (mapId, contentData) => {
	const { error } = await supabase
		.from('maps')
		.update({
			data: contentData,
			updated_at: new Date(),
		})
		.eq('id', mapId);

	if (error) throw error;
	return true;
};
