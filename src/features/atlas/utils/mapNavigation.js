import { campaign_001_map_data } from '@/features/atlas/data/campaign_01/index';
import { campaign_002_map_data } from '@/features/atlas/data/campaign_02/index'; // Ensure path is correct

// FIX: Keys updated to match Database "map_data" attribute values
export const CAMPAIGN_REGISTRY = {
	campaign_001_map_data: campaign_001_map_data,
	campaign_002_map_data: campaign_002_map_data,
};

export const getMapConfig = (mapKey, campaignData) => {
	// 1. Use context data if provided
	// If campaignData is null (loading/error), we don't want to default to Campaign 1 immediately
	// or it will flash the wrong map.
	const rootData = campaignData;

	if (!rootData) return null;

	// 2. Direct Lookup
	if (rootData.maps && rootData.maps[mapKey]) {
		return rootData.maps[mapKey];
	}

	console.warn(`[getMapConfig] Map ID not found: ${mapKey}`);
	return null;
};
