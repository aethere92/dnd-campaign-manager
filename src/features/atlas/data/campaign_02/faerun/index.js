// features/atlas/data/maps/faerun/index.js

export const FAERUN_MAP = {
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
	annotations: {
		locations: { name: 'Locations', items: [] },
		pois: { name: 'Points of Interest', items: [] },
	},
	paths: [],
	areas: {},
	overlays: [],
};
