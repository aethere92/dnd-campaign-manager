import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getMapConfig } from './utils/mapNavigation'; // Legacy File Loader
import { fetchMapByKey } from './api/mapService'; // New DB Loader

export function useMapData() {
	const { campaignData, campaignId, isLoading: isCampaignLoading } = useCampaign();
	const [searchParams, setSearchParams] = useSearchParams();

	// New State for DB Data
	const [dbMapData, setDbMapData] = useState(null);
	const [isMapLoading, setIsMapLoading] = useState(false);

	const urlMapKey = searchParams.get('map');

	// 1. Determine effective map key
	const currentMapKey = urlMapKey || campaignData?.defaultMap;

	// 2. Fetch from DB when key changes
	useEffect(() => {
		let isMounted = true;

		const loadMap = async () => {
			if (!currentMapKey || !campaignId) return;

			setIsMapLoading(true);
			try {
				// Try DB First
				const fromDb = await fetchMapByKey(campaignId, currentMapKey);

				if (isMounted) {
					if (fromDb) {
						console.log(`[Atlas] Loaded map '${currentMapKey}' from Database.`);
						setDbMapData(fromDb);
					} else {
						// If not in DB, fall back to null (will use Legacy below)
						console.log(`[Atlas] Map '${currentMapKey}' not found in DB. Using legacy files.`);
						setDbMapData(null);
					}
				}
			} catch (err) {
				console.error(err);
			} finally {
				if (isMounted) setIsMapLoading(false);
			}
		};

		loadMap();

		return () => {
			isMounted = false;
		};
	}, [campaignId, currentMapKey]);

	// 3. Update URL if needed (legacy behavior)
	useEffect(() => {
		if (!urlMapKey && campaignData?.defaultMap) {
			setSearchParams({ map: campaignData.defaultMap }, { replace: true });
		}
	}, [urlMapKey, campaignData, setSearchParams]);

	// 4. Merge Logic: DB > Legacy File
	const mapConfig = useMemo(() => {
		if (dbMapData) return dbMapData;
		// Fallback to file registry
		return getMapConfig(currentMapKey, campaignData);
	}, [dbMapData, currentMapKey, campaignData]);

	const viewData = useMemo(() => {
		if (!mapConfig) return null;

		const { metadata, annotations, paths, areas, overlays } = mapConfig;

		if (!metadata) return null;

		const scaleFactor = Math.pow(2, metadata.sizes.maxZoom);
		const bounds = [
			[-metadata.sizes.imageHeight / scaleFactor, 0],
			[0, metadata.sizes.imageWidth / scaleFactor],
		];

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
		isLoading: isMapLoading, // Return specific map loading state
	};
}
