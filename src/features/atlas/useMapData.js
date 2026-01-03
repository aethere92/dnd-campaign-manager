import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getMapConfig } from './utils/mapNavigation';

export function useMapData() {
	const { campaignData } = useCampaign();
	const [searchParams, setSearchParams] = useSearchParams();

	const currentMapKey = searchParams.get('map') || 'world_maps'; // Default updated to match typical ID

	const mapConfig = useMemo(() => {
		// If campaignData comes from API/DB, ensure it matches the { maps: { ... } } structure
		return getMapConfig(currentMapKey, campaignData);
	}, [currentMapKey, campaignData]);

	const viewData = useMemo(() => {
		if (!mapConfig) return null;

		const { metadata, annotations, paths, areas, overlays } = mapConfig;

		// --- MATH FIX ---
		const scaleFactor = Math.pow(2, metadata.sizes.maxZoom);
		const bounds = [
			[-metadata.sizes.imageHeight / scaleFactor, 0],
			[0, metadata.sizes.imageWidth / scaleFactor],
		];

		// --- MARKER FLATTENING ---
		// The modular structure still passes 'annotations' as an object with categories
		const markers = [];
		if (annotations) {
			Object.entries(annotations).forEach(([categoryKey, category]) => {
				if (category.items) {
					category.items.forEach((item) => {
						markers.push({
							...item,
							category: category.name,
							categoryId: categoryKey,
							position: [Number(item.lat), Number(item.lng)],
						});
					});
				}
			});
		}

		// Process Areas
		const mapAreas = [];
		if (areas) {
			Object.values(areas).forEach((category) => {
				category.items.forEach((area) => {
					mapAreas.push({
						...area,
						positions: area.points.map((p) => p.coordinates),
					});
				});
			});
		}

		return {
			config: metadata, // mapConfig.metadata usually contains path, sizes, etc.
			bounds,
			markers,
			sessions: paths || [],
			areas: mapAreas,
			overlays: overlays || [],
		};
	}, [mapConfig]);

	const navigateToMap = (mapKey) => {
		setSearchParams({ map: mapKey });
	};

	return {
		data: viewData,
		currentMapKey,
		navigateToMap,
		isLoading: false,
	};
}
