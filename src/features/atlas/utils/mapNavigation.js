import { CAMPAIGN_01, CAMPAIGN_01_ALIASES } from '@/features/atlas/data/campaign_01';

/**
 * Resolves the configuration object for a specific map key.
 * Handles aliases (e.g. 'korinis_island' -> 'world_maps.submaps...')
 */
export const getMapConfig = (mapKey, campaignData) => {
	// 1. If we have dynamic campaign data from Supabase/Context, use it.
	// Otherwise fallback to the static file.
	const rootData = campaignData || CAMPAIGN_01;

	// 2. Resolve Alias
	const fullPath = CAMPAIGN_01_ALIASES[mapKey] || mapKey || 'world_map';
	const pathParts = fullPath.split('.');

	// 3. Traverse
	// Note: We skip 'submaps' keyword if it appears in the path to make traversal robust
	// but based on your alias structure, we just follow the dots exactly.
	try {
		const config = pathParts.reduce((current, key) => {
			return current && current[key] ? current[key] : null;
		}, rootData);

		return config;
	} catch (e) {
		console.error(`Failed to load map config for: ${mapKey}`, e);
		return null;
	}
};

/**
 * Helper to calculate map bounds based on image size
 */
export const calculateBounds = (imageWidth, imageHeight) => {
	// In CRS.Simple, [0,0] is usually bottom-left.
	// We map [0,0] to top-left for easier mental mapping if needed,
	// but standard Leaflet CRS.Simple treats Y as going up.
	// Typically: [[0,0], [height, width]]
	return [
		[-imageHeight, 0],
		[0, imageWidth],
	];
};
