import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getMapConfig } from './utils/mapNavigation';

export function useMapData() {
	const { campaignData } = useCampaign();
	const [searchParams, setSearchParams] = useSearchParams();

	const currentMapKey = searchParams.get('map') || 'world_map';

	const mapConfig = useMemo(() => {
		const sourceData = campaignData?.map_data || null;
		return getMapConfig(currentMapKey, sourceData);
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

		// 3. Process Areas
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
			config: metadata,
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
		isLoading: false, // FIX: Since we're using static data, never loading
	};
}
