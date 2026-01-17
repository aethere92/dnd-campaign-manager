import React, { createContext, useContext, useMemo } from 'react';
import { useAtlasReducer } from './hooks/useAtlasReducer';
import { useAtlasActions } from './hooks/useAtlasActions';
import { normalizeMapData, serializeMapData } from './services/atlasMapper';
import { updateMapData } from '@/features/atlas/api/mapService';

const AtlasEditorContext = createContext(null);

// UPDATED: Added onSave prop
export const AtlasEditorProvider = ({ initialData, onSave, children }) => {
	// 1. Initialize State
	const normalizedInitialState = useMemo(() => {
		return {
			...normalizeMapData(initialData),
			mapId: initialData.id,
			mapConfig: initialData.metadata,
		};
	}, [initialData]);

	// 2. Load Reducer
	const [state, dispatch] = useAtlasReducer(normalizedInitialState);

	// 3. Load Actions
	const actions = useAtlasActions(dispatch);

	// 4. Define Save Handler
	const saveMap = async () => {
		dispatch({ type: 'SET_SAVING', payload: true });
		try {
			const payload = serializeMapData(state);

			// FIX: Check if a custom save handler exists (for Tactical Map)
			if (onSave) {
				await onSave(payload);
			} else {
				// Default behavior: Update DB
				await updateMapData(state.mapId, payload);
				alert('Map saved successfully.');
			}
		} catch (e) {
			console.error(e);
			alert('Save failed: ' + e.message);
		} finally {
			dispatch({ type: 'SET_SAVING', payload: false });
		}
	};

	const value = useMemo(() => ({ state, dispatch, actions, saveMap }), [state, actions]);

	return <AtlasEditorContext.Provider value={value}>{children}</AtlasEditorContext.Provider>;
};

export const useAtlasEditor = () => {
	const ctx = useContext(AtlasEditorContext);
	if (!ctx) throw new Error('useAtlasEditor must be used within AtlasEditorProvider');
	return ctx;
};
