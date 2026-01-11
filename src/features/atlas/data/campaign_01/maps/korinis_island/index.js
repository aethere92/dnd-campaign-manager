import { paths } from './paths.js';
import { annotations } from './annotations.js';
import { areas } from './areas.js';
import { overlays } from './overlays.js';

export const KORINIS_ISLAND = {
	metadata: {
		path: 'https://yffukfulnggfhlgoyowg.supabase.co/storage/v1/object/public/atlas/maps/khorinis',
		mapId: 'khorinis',
		sizes: {
			maxZoom: 7,
			imageWidth: 32069,
			imageHeight: 19161,
		},
	},
	annotations: annotations,
	paths: paths,
	areas: areas,
	overlays: overlays,
	parentId: 'faerun_map',
};
