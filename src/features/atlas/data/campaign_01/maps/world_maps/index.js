import { paths } from './paths.js';
import { annotations } from './annotations.js';

export const WORLD_MAPS = {
	metadata: {
		path: 'maps/world_maps/world_map',
		mapId: 'world_maps',
		sizes: {
			maxZoom: 5,
			imageWidth: 8192,
			imageHeight: 8192
		}
	},
	annotations: annotations,
	paths: paths
};