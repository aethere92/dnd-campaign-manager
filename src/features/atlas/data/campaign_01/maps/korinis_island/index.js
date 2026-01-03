import { paths } from './paths.js';
import { annotations } from './annotations.js';
import { areas } from './areas.js';
import { overlays } from './overlays.js';

export const KORINIS_ISLAND = {
	metadata: {
		path: 'maps/world_maps/korinis_island',
		mapId: 'korinis_island',
		sizes: {
			maxZoom: 5,
			imageWidth: 32069,
			imageHeight: 19161
		}
	},
	annotations: annotations,
	paths: paths,
	areas: areas,
	overlays: overlays,
	parentId: 'world_maps'
};