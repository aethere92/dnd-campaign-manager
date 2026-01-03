// 1. Update the import to point to your new generated folder
// Ensure this path matches where your modularize.js script output the files
import { CAMPAIGN_01 } from '@/features/atlas/data/campaign_01/index';

/**
 * Resolves the configuration object for a specific map key.
 *
 * CHANGE: With the modular structure, all maps are now siblings
 * in the .maps object, so deep traversal/aliases are no longer needed.
 */
export const getMapConfig = (mapKey, campaignData) => {
	// 1. Use context data if provided, otherwise fallback to static generated file
	const rootData = campaignData || CAMPAIGN_01;

	// 2. Determine ID (Default to 'world_maps' if undefined)
	// Make sure 'world_maps' matches the mapId in your world map's metadata
	const targetId = mapKey || 'world_maps';

	// 3. Direct Lookup
	// The new structure is simply { maps: { [id]: { ...config } } }
	if (rootData.maps && rootData.maps[targetId]) {
		return rootData.maps[targetId];
	}

	console.warn(`[getMapConfig] Map ID not found: ${targetId}`);
	return null;
};

/**
 * Helper to calculate map bounds based on image size
 */
export const calculateBounds = (imageWidth, imageHeight) => {
	return [
		[-imageHeight, 0],
		[0, imageWidth],
	];
};
