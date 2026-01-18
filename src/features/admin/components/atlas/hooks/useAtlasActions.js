import { useMemo } from 'react';
import { calculateNewOverlayBounds } from '../services/geometryUtils';

export const useAtlasActions = (dispatch) => {
	return useMemo(
		() => ({
			// --- SELECTION & MODES ---
			selectItem: (type, id, index) => dispatch({ type: 'SELECT_ITEM', payload: { type, id, index } }),

			deselect: () => dispatch({ type: 'SELECT_ITEM', payload: null }),

			setTool: (tool) => dispatch({ type: 'SET_TOOL', payload: tool }),

			setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),

			toggleVisibility: (layer) => dispatch({ type: 'TOGGLE_VISIBILITY', payload: layer }),

			// --- MARKERS ---
			addMarker: (marker) => dispatch({ type: 'ADD_MARKER', payload: marker }),

			updateMarker: (id, updates) => dispatch({ type: 'UPDATE_MARKER', id, updates }),

			deleteMarker: (id) => dispatch({ type: 'DELETE_MARKER', id }),

			// --- PATHS ---
			addPath: (path) => dispatch({ type: 'ADD_PATH', payload: path }),

			updatePath: (id, updates) => dispatch({ type: 'UPDATE_PATH', id, updates }),

			deletePath: (id) => dispatch({ type: 'DELETE_PATH', id }),

			// Path Points
			updatePathPoint: (id, index, updates) => dispatch({ type: 'UPDATE_PATH_POINT', id, index, updates }),

			appendPathPoint: (id, coordinates) => dispatch({ type: 'APPEND_PATH_POINT', id, coordinates }),

			insertPathPoint: (id, index, coordinates) => dispatch({ type: 'INSERT_PATH_POINT', id, index, coordinates }),

			deletePathPoint: (id, index) => dispatch({ type: 'DELETE_PATH_POINT', id, index }),

			// --- AREAS ---
			addArea: (area) => dispatch({ type: 'ADD_AREA', payload: area }),

			updateArea: (id, updates) => dispatch({ type: 'UPDATE_AREA', id, updates }),

			deleteArea: (id) => dispatch({ type: 'DELETE_AREA', id }),

			// Area Vertices
			updateAreaPoint: (id, index, coordinates) => dispatch({ type: 'UPDATE_AREA_POINT', id, index, coordinates }),

			appendAreaPoint: (id, coordinates) => dispatch({ type: 'APPEND_AREA_POINT', id, coordinates }),

			insertAreaPoint: (id, index, coordinates) => dispatch({ type: 'INSERT_AREA_POINT', id, index, coordinates }),

			deleteAreaPoint: (id, index) => dispatch({ type: 'DELETE_AREA_POINT', id, index }),

			// --- OVERLAYS (The Complex Logic) ---
			addOverlay: (overlay) => dispatch({ type: 'ADD_OVERLAY', payload: overlay }),

			updateOverlay: (id, updates) => dispatch({ type: 'UPDATE_OVERLAY', id, updates }),

			deleteOverlay: (id) => dispatch({ type: 'DELETE_OVERLAY', id }),

			/**
			 * specialized action to handle resizing logic
			 * @param {string} id
			 * @param {string} handle - 'tl', 'tr', 'bl', 'br'
			 * @param {number} lat
			 * @param {number} lng
			 * @param {Array} currentBounds
			 */
			resizeOverlay: (id, handle, lat, lng, currentBounds) => {
				const newBounds = calculateNewOverlayBounds(handle, lat, lng, currentBounds);
				dispatch({ type: 'UPDATE_OVERLAY', id, updates: { bounds: newBounds } });
			},

			moveOverlay: (id, newCenter, oldCenter, oldBounds) => {
				const latDiff = newCenter.lat - oldCenter.lat;
				const lngDiff = newCenter.lng - oldCenter.lng;

				const newBounds = [
					[oldBounds[0][0] + latDiff, oldBounds[0][1] + lngDiff],
					[oldBounds[1][0] + latDiff, oldBounds[1][1] + lngDiff],
				];

				dispatch({ type: 'UPDATE_OVERLAY', id, updates: { bounds: newBounds } });
			},

			openContextMenu: (payload) => dispatch({ type: 'OPEN_CONTEXT_MENU', payload }),
			closeContextMenu: () => dispatch({ type: 'CLOSE_CONTEXT_MENU' }),

			updateMapConfig: (updates) => dispatch({ type: 'UPDATE_MAP_CONFIG', updates }),
			updateViewport: (center, zoom) => dispatch({ type: 'UPDATE_VIEWPORT', payload: { center, zoom } }),
		}),
		[dispatch],
	);
};
