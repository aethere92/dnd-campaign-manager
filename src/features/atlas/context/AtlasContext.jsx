import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { fetchMapByKey } from '../api/mapService';

const AtlasContext = createContext(null);

export const AtlasProvider = ({ children }) => {
	const { campaignId, campaignData } = useCampaign();
	const [searchParams, setSearchParams] = useSearchParams();

	// -- Data State --
	const [mapData, setMapData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// -- UI State --
	const [visibility, setVisibility] = useState({});
	const [flyToTarget, setFlyToTarget] = useState(null);
	const [activeTab, setActiveTab] = useState('locations');

	const currentMapKey = searchParams.get('map') || campaignData?.defaultMap;

	// Helper: Generate Unique ID
	const generateId = (type, categoryKey, index, label) => {
		const safeLabel = (label || 'unknown').replace(/\s+/g, '_').toLowerCase();
		return `${type}-${categoryKey}-${index}-${safeLabel}`;
	};

	// 1. Fetch Data
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!campaignId || !currentMapKey) return;

			setIsLoading(true);
			try {
				const data = await fetchMapByKey(campaignId, currentMapKey);
				if (isMounted) {
					setMapData(data);
					if (data) initializeVisibility(data);
				}
			} catch (err) {
				console.error(err);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [campaignId, currentMapKey]);

	// 2. Initialize Visibility Helper
	const initializeVisibility = (data) => {
		const initial = { areas: true };

		// Markers
		if (data.annotations) {
			Object.entries(data.annotations).forEach(([key, cat]) => {
				if (cat.items) {
					cat.items.forEach((item, index) => {
						const id = item.id || generateId('marker', key, index, item.label);
						initial[id] = true;
					});
				}
			});
		}

		// Areas
		if (data.areas) {
			Object.entries(data.areas).forEach(([key, cat]) => {
				if (cat.items) {
					cat.items.forEach((item, index) => {
						const id = item.id || generateId('area', key, index, item.name);
						initial[id] = true;
					});
				}
			});
		}

		// Default OFF
		if (data.paths) data.paths.forEach((p) => (initial[`session-${p.name}`] = false));
		if (data.overlays) data.overlays.forEach((o) => (initial[`overlay-${o.name}`] = false));

		setVisibility(initial);
	};

	// 3. Actions
	const navigateToMap = (key) => setSearchParams({ map: key });

	const flyTo = useCallback((position) => {
		setFlyToTarget(position);
	}, []);

	const toggleItem = useCallback((id) => {
		setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
	}, []);

	const toggleGroup = useCallback((ids, forceState = null) => {
		setVisibility((prev) => {
			const next = { ...prev };
			const targetState = forceState !== null ? forceState : !prev[ids[0]];
			ids.forEach((id) => (next[id] = targetState));
			return next;
		});
	}, []);

	// 4. View Model
	const viewData = useMemo(() => {
		if (!mapData) return null;

		const markers = [];
		const groups = [];

		// Process Markers
		if (mapData.annotations) {
			Object.entries(mapData.annotations).forEach(([key, category]) => {
				const groupItems = (category.items || []).map((item, index) => ({
					...item,
					// Generate stable, unique ID using index
					id: item.id || generateId('marker', key, index, item.label),
					category: category.name,
					categoryId: key,
					position: [Number(item.lat), Number(item.lng)],
				}));

				markers.push(...groupItems);

				if (groupItems.length > 0) {
					groups.push({
						id: key,
						label: category.name,
						items: groupItems,
					});
				}
			});
		}

		// Process Areas
		const areas = mapData.areas
			? Object.entries(mapData.areas).flatMap(([key, cat]) =>
					(cat.items || []).map((item, index) => {
						// Centroid fallback
						const pos = item.labelPosition || (item.positions && item.positions[0]) || [0, 0];
						return {
							...item,
							id: item.id || generateId('area', key, index, item.name),
							label: item.name,
							position: pos,
						};
					})
			  )
			: [];

		return {
			config: mapData,
			markers,
			groups,
			sessions: mapData.paths || [],
			overlays: mapData.overlays || [],
			areas: areas,
		};
	}, [mapData]);

	const value = {
		mapData: viewData,
		rawConfig: mapData,
		isLoading,
		visibility,
		activeTab,
		setActiveTab,
		toggleItem,
		toggleGroup,
		navigateToMap,
		flyTo,
		flyToTarget,
	};

	return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
};

export const useAtlas = () => {
	const context = useContext(AtlasContext);
	if (!context) throw new Error('useAtlas must be used within AtlasProvider');
	return context;
};
