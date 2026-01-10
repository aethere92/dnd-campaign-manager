import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { updateMapData } from '@/features/atlas/api/mapService';

const AtlasEditorContext = createContext(null);

// --- INITIALIZER ---
const initializeState = (initialData) => {
	// ... existing initialization logic ...
	const markers = [];
	const rawAnn = initialData.annotations || {};
	Object.keys(rawAnn).forEach((cat) => {
		if (rawAnn[cat].items) {
			rawAnn[cat].items.forEach((item) => {
				markers.push({ ...item, category: cat, _id: crypto.randomUUID() });
			});
		}
	});

	const paths = (initialData.paths || []).map((p) => ({
		...p,
		_id: crypto.randomUUID(),
		points: (Array.isArray(p.points) ? p.points : []).map((pt) =>
			Array.isArray(pt) ? { coordinates: pt, text: '' } : pt
		),
	}));

	const areas = [];
	const rawAreas = initialData.areas || {};
	if (Array.isArray(rawAreas)) {
		rawAreas.forEach((a) => {
			areas.push({
				...a,
				points: Array.isArray(a.points) ? a.points : [],
				_id: crypto.randomUUID(),
			});
		});
	} else {
		Object.values(rawAreas).forEach((cat) => {
			if (cat.items) {
				cat.items.forEach((a) => {
					areas.push({
						...a,
						points: Array.isArray(a.points) ? a.points : [],
						_id: crypto.randomUUID(),
					});
				});
			}
		});
	}

	const overlays = (initialData.overlays || []).map((o) => ({
		...o,
		_id: crypto.randomUUID(),
	}));

	return {
		mapId: initialData.id,
		mapConfig: initialData.metadata,
		markers,
		paths,
		areas,
		overlays,
		selection: null,
		mode: 'select',
		activeTool: 'markers',
		isSaving: false,
		// NEW: Visibility State (Map of ID/Type -> Boolean)
		visibility: {
			markers: true,
			paths: true,
			areas: true,
			overlays: true,
		},
	};
};

// --- REDUCER ---
const reducer = (state, action) => {
	switch (action.type) {
		case 'SELECT_ITEM':
			return { ...state, selection: action.payload, mode: 'select' };

		case 'SET_TOOL':
			return { ...state, activeTool: action.payload, selection: null, mode: 'select' };

		case 'SET_MODE':
			return { ...state, mode: action.payload };

		// --- NEW: VISIBILITY ---
		case 'TOGGLE_VISIBILITY': {
			const target = action.payload; // 'markers', 'paths', 'areas', 'overlays' or specific ID
			return {
				...state,
				visibility: {
					...state.visibility,
					[target]: !state.visibility[target],
				},
			};
		}

		// --- CRUD: MARKERS ---
		case 'ADD_MARKER':
			return {
				...state,
				markers: [...state.markers, action.payload],
				selection: { type: 'marker', id: action.payload._id },
			};
		case 'UPDATE_MARKER':
			return { ...state, markers: state.markers.map((m) => (m._id === action.id ? { ...m, ...action.updates } : m)) };
		case 'DELETE_MARKER':
			return { ...state, markers: state.markers.filter((m) => m._id !== action.id), selection: null };

		// --- CRUD: PATHS ---
		case 'ADD_PATH':
			return {
				...state,
				paths: [...state.paths, action.payload],
				selection: { type: 'path', id: action.payload._id },
				mode: 'draw',
			};
		case 'UPDATE_PATH':
			return { ...state, paths: state.paths.map((p) => (p._id === action.id ? { ...p, ...action.updates } : p)) };
		case 'DELETE_PATH':
			return { ...state, paths: state.paths.filter((p) => p._id !== action.id), selection: null };
		case 'UPDATE_PATH_POINT': {
			return {
				...state,
				paths: state.paths.map((p) => {
					if (p._id !== action.id) return p;
					const newPoints = [...p.points];
					newPoints[action.index] = { ...newPoints[action.index], ...action.updates };
					return { ...p, points: newPoints };
				}),
			};
		}
		case 'APPEND_PATH_POINT': {
			return {
				...state,
				paths: state.paths.map((p) => {
					if (p._id !== action.id) return p;
					return { ...p, points: [...p.points, { coordinates: action.coordinates }] };
				}),
			};
		}

		// --- CRUD: AREAS (Enhanced) ---
		case 'ADD_AREA':
			return {
				...state,
				areas: [...state.areas, action.payload],
				selection: { type: 'area', id: action.payload._id },
				mode: 'draw',
			};
		case 'UPDATE_AREA':
			return { ...state, areas: state.areas.map((a) => (a._id === action.id ? { ...a, ...action.updates } : a)) };
		case 'DELETE_AREA':
			return { ...state, areas: state.areas.filter((a) => a._id !== action.id), selection: null };
		case 'UPDATE_AREA_POINT': {
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					const newPoints = [...a.points];
					newPoints[action.index] = { ...newPoints[action.index], coordinates: action.coordinates };
					return { ...a, points: newPoints };
				}),
			};
		}
		case 'APPEND_AREA_POINT': {
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					const pts = a.points || [];
					return { ...a, points: [...pts, { coordinates: action.coordinates }] };
				}),
			};
		}
		// NEW: INSERT/DELETE VERTICES
		case 'INSERT_AREA_POINT': {
			// Inserts at specific index (for splitting lines)
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					const newPoints = [...a.points];
					// Insert at index + 1
					newPoints.splice(action.index + 1, 0, { coordinates: action.coordinates });
					return { ...a, points: newPoints };
				}),
			};
		}
		case 'DELETE_AREA_POINT': {
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					const newPoints = a.points.filter((_, i) => i !== action.index);
					return { ...a, points: newPoints };
				}),
			};
		}

		// --- CRUD: OVERLAYS ---
		case 'ADD_OVERLAY':
			return {
				...state,
				overlays: [...state.overlays, action.payload],
				selection: { type: 'overlay', id: action.payload._id },
			};
		case 'UPDATE_OVERLAY':
			return { ...state, overlays: state.overlays.map((o) => (o._id === action.id ? { ...o, ...action.updates } : o)) };
		case 'DELETE_OVERLAY':
			return { ...state, overlays: state.overlays.filter((o) => o._id !== action.id), selection: null };

		case 'SET_SAVING':
			return { ...state, isSaving: action.payload };

		default:
			return state;
	}
};

export const AtlasEditorProvider = ({ initialData, children }) => {
	const [state, dispatch] = useReducer(reducer, initialData, initializeState);

	// --- SAVING LOGIC ---
	const saveMap = async () => {
		dispatch({ type: 'SET_SAVING', payload: true });
		try {
			const annotations = {};
			state.markers.forEach((m) => {
				const cat = m.category || 'default';
				const catName = cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
				if (!annotations[cat]) annotations[cat] = { name: catName, items: [] };
				const { _id, category, ...rest } = m;
				annotations[cat].items.push(rest);
			});

			const paths = state.paths.map(({ _id, ...rest }) => rest);
			const areas = {
				regions: { name: 'Regions', items: state.areas.map(({ _id, ...rest }) => rest) },
			};
			const overlays = state.overlays.map(({ _id, ...rest }) => rest);

			const contentData = { annotations, paths, areas, overlays };
			await updateMapData(state.mapId, contentData);
			alert('Map saved successfully.');
		} catch (e) {
			console.error(e);
			alert('Save failed: ' + e.message);
		} finally {
			dispatch({ type: 'SET_SAVING', payload: false });
		}
	};

	const value = useMemo(() => ({ state, dispatch, saveMap }), [state]);

	return <AtlasEditorContext.Provider value={value}>{children}</AtlasEditorContext.Provider>;
};

export const useAtlasEditor = () => {
	const ctx = useContext(AtlasEditorContext);
	if (!ctx) throw new Error('useAtlasEditor must be used within AtlasEditorProvider');
	return ctx;
};
