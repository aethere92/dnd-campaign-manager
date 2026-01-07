import { FAERUN_MAP } from './faerun/index.js';

export const campaign_002_map_data = {
	name: 'Red Hand of Doom',
	defaultMap: 'faerun_map',
	maps: {
		// The ID here MUST match the mapId in the metadata
		[FAERUN_MAP.metadata.mapId]: FAERUN_MAP,
	},
};
