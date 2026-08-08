import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { routes } from '@/app/routes';
import { fetchMapByKey } from '../api/mapService';
const AtlasContext = createContext(null);

// Helper: Generate Unique ID
const generateId = (type, categoryKey, index, label) => {
	const safeLabel = (label || 'unknown').replace(/\s+/g, '_').toLowerCase();
	return `${type}-${categoryKey}-${index}-${safeLabel}`;
};

/**
 * Builds the initial per-layer visibility map for a freshly-loaded map.
 *
 * At module scope because it is a pure function of `data` — it neither reads nor
 * writes component state. Previously it was declared inside the provider *below*
 * the effect that called it, which meant the effect could not honestly list it as
 * a dependency.
 */
const buildInitialVisibility = (data) => {
	const initial = { areas: false };

	// Markers
	if (data.annotations) {
		Object.entries(data.annotations).forEach(([key, cat]) => {
			if (cat.items) {
				cat.items.forEach((item, index) => {
					const id = item.id || generateId('marker', key, index, item.label);
					initial[id] = item.visibleOnLoad !== false;
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
					initial[id] = item.visibleOnLoad === true;
				});
			}
		});
	}

	// Default OFF
	if (data.paths) data.paths.forEach((p) => (initial[`session-${p.name}`] = p.visibleOnLoad === true));
	if (data.overlays) data.overlays.forEach((o) => (initial[`overlay-${o.name}`] = o.visibleOnLoad === true));

	// Use 'fog' key to track layer visibility.
	// Fog always starts hidden so the user opts in rather than being greeted
	// by an obscured map.
	initial['fog'] = false;

	return initial;
};

export const AtlasProvider = ({ children }) => {
	const { campaignId, campaignData } = useCampaign();
	const { campaignId: campaignIdParam, mapId } = useParams();
	const navigate = useNavigate();
	// -- Data State --
	const [mapData, setMapData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// -- UI State --
	const [visibility, setVisibility] = useState({});
	const [flyToTarget, setFlyToTarget] = useState(null);
	const [activeTab, setActiveTab] = useState('locations');

	// The map is identified by the :mapId path segment (so the URL is shareable),
	// falling back to the campaign's default. lat/lng/zoom stay in the query string
	// because they are transient view state, not identity.
	const currentMapKey = mapId || campaignData?.defaultMap;

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
					if (data) setVisibility(buildInitialVisibility(data));
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

	// 2. Actions
	// The map key now lives in the path (/c/:id/atlas/:mapId). Any target view
	// (lat/lng/zoom) rides along as query params, which MapCanvas reads on load.
	const navigateToMap = (key, targetView = null) => {
		const query = new URLSearchParams();
		if (targetView) {
			if (targetView.lat) query.set('lat', targetView.lat);
			if (targetView.lng) query.set('lng', targetView.lng);
			if (targetView.zoom) query.set('z', targetView.zoom);
		}
		const qs = query.toString();
		const base = routes.campaign.atlas(campaignIdParam ?? campaignId, key);
		navigate(qs ? `${base}?${qs}` : base);
	};

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

	// 3. View Model
	const viewData = useMemo(() => {
		if (!mapData) return null;

		const markers = [];
		const groups = [];

		// Process Markers
		if (mapData.annotations) {
			Object.entries(mapData.annotations).forEach(([key, category]) => {
				const groupItems = (category.items || []).map((item, index) => ({
					...item,
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

		// Pass Fog Data safely
		const fog = mapData.fog || { enabled: false, shapes: [] };

		return {
			config: mapData,
			markers,
			groups,
			sessions: mapData.paths || [],
			overlays: mapData.overlays || [],
			areas: areas,
			fog: fog,
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
