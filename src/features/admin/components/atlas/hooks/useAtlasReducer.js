import { useReducer } from 'react';

const initialState = {
	markers: [],
	paths: [],
	areas: [],
	overlays: [],
	selection: null, // { type, id, index? }
	mode: 'select', // 'select' | 'draw'
	activeTool: 'markers',
	isSaving: false,
	visibility: {
		markers: true,
		paths: true,
		areas: true,
		overlays: true,
	},
	contextMenu: null,
};

const reducer = (state, action) => {
	switch (action.type) {
		// --- GLOBAL ---
		case 'INIT_DATA':
			return { ...state, ...action.payload };

		case 'SET_MODE':
			return { ...state, mode: action.payload };

		case 'SET_TOOL':
			return { ...state, activeTool: action.payload, selection: null, mode: 'select' };

		case 'SELECT_ITEM':
			return { ...state, selection: action.payload, mode: 'select' }; // Reset draw mode on select

		case 'TOGGLE_VISIBILITY':
			return {
				...state,
				visibility: {
					...state.visibility,
					[action.payload]: !state.visibility[action.payload],
				},
			};

		case 'SET_SAVING':
			return { ...state, isSaving: action.payload };

		// --- MARKERS ---
		case 'ADD_MARKER':
			return {
				...state,
				markers: [...state.markers, action.payload],
				selection: { type: 'marker', id: action.payload._id },
			};
		case 'UPDATE_MARKER':
			return {
				...state,
				markers: state.markers.map((m) => (m._id === action.id ? { ...m, ...action.updates } : m)),
			};
		case 'DELETE_MARKER':
			return {
				...state,
				markers: state.markers.filter((m) => m._id !== action.id),
				selection: null,
			};

		// --- PATHS ---
		case 'ADD_PATH':
			return {
				...state,
				paths: [...state.paths, action.payload],
				selection: { type: 'path', id: action.payload._id },
				mode: 'draw', // Auto enter draw mode
			};
		case 'UPDATE_PATH':
			return {
				...state,
				paths: state.paths.map((p) => (p._id === action.id ? { ...p, ...action.updates } : p)),
			};
		case 'DELETE_PATH':
			return {
				...state,
				paths: state.paths.filter((p) => p._id !== action.id),
				selection: null,
			};
		case 'UPDATE_PATH_POINT':
			return {
				...state,
				paths: state.paths.map((p) => {
					if (p._id !== action.id) return p;
					const newPoints = [...p.points];
					newPoints[action.index] = { ...newPoints[action.index], ...action.updates };
					return { ...p, points: newPoints };
				}),
			};
		case 'APPEND_PATH_POINT':
			return {
				...state,
				paths: state.paths.map((p) => {
					if (p._id !== action.id) return p;
					return { ...p, points: [...p.points, { coordinates: action.coordinates, text: '' }] };
				}),
			};
		case 'INSERT_PATH_POINT':
			return {
				...state,
				paths: state.paths.map((p) => {
					if (p._id !== action.id) return p;
					const newPoints = [...p.points];
					newPoints.splice(action.index, 0, { coordinates: action.coordinates, text: '' });
					return { ...p, points: newPoints };
				}),
			};
		case 'DELETE_PATH_POINT':
			return {
				...state,
				paths: state.paths.map((p) => {
					if (p._id !== action.id) return p;
					const newPoints = p.points.filter((_, i) => i !== action.index);
					return { ...p, points: newPoints };
				}),
			};

		// --- AREAS ---
		case 'ADD_AREA':
			return {
				...state,
				areas: [...state.areas, action.payload],
				selection: { type: 'area', id: action.payload._id },
				mode: 'draw',
			};
		case 'UPDATE_AREA':
			return {
				...state,
				areas: state.areas.map((a) => (a._id === action.id ? { ...a, ...action.updates } : a)),
			};
		case 'DELETE_AREA':
			return {
				...state,
				areas: state.areas.filter((a) => a._id !== action.id),
				selection: null,
			};
		case 'UPDATE_AREA_POINT':
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					const newPoints = [...a.points];
					newPoints[action.index] = { ...newPoints[action.index], coordinates: action.coordinates };
					return { ...a, points: newPoints };
				}),
			};
		case 'APPEND_AREA_POINT':
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					// Fix: Ensure coordinates is wrapped in object if your structure requires it,
					// though mapper normalizes this.
					return { ...a, points: [...a.points, { coordinates: action.coordinates }] };
				}),
			};
		case 'INSERT_AREA_POINT':
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					const newPoints = [...a.points];
					newPoints.splice(action.index + 1, 0, { coordinates: action.coordinates });
					return { ...a, points: newPoints };
				}),
			};
		case 'DELETE_AREA_POINT':
			return {
				...state,
				areas: state.areas.map((a) => {
					if (a._id !== action.id) return a;
					return { ...a, points: a.points.filter((_, i) => i !== action.index) };
				}),
			};

		// --- OVERLAYS ---
		case 'ADD_OVERLAY':
			return {
				...state,
				overlays: [...state.overlays, action.payload],
				selection: { type: 'overlay', id: action.payload._id },
			};
		case 'UPDATE_OVERLAY':
			return {
				...state,
				overlays: state.overlays.map((o) => (o._id === action.id ? { ...o, ...action.updates } : o)),
			};
		case 'DELETE_OVERLAY':
			return {
				...state,
				overlays: state.overlays.filter((o) => o._id !== action.id),
				selection: null,
			};

		case 'OPEN_CONTEXT_MENU':
			return { ...state, contextMenu: action.payload };

		case 'CLOSE_CONTEXT_MENU':
			return { ...state, contextMenu: null };

		default:
			return state;
	}
};

export const useAtlasReducer = (preloadedState) => {
	// Merge defaults (visibility, tools) with DB data (markers, mapConfig)
	const effectiveState = { ...initialState, ...preloadedState };

	const [state, dispatch] = useReducer(reducer, effectiveState);
	return [state, dispatch];
};
