import { paths } from './paths.js';
import { annotations } from './annotations.js';

export const WORLD_MAPS = {
	metadata: {
		mapId: 'faerun_map',
		path: 'https://yffukfulnggfhlgoyowg.supabase.co/storage/v1/object/public/atlas/maps/faerun',
		fileExtension: 'webp',
		sizes: {
			maxZoom: 7,
			imageWidth: 18607,
			imageHeight: 15017,
		},
		label: 'Faerûn',
	},
	annotations: annotations,
	paths: paths,
};
