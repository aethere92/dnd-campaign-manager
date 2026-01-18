import React, { createContext, useContext, useMemo } from 'react';
import { useAtlasReducer } from './hooks/useAtlasReducer';
import { useAtlasActions } from './hooks/useAtlasActions';
import { normalizeMapData, serializeMapData } from './services/atlasMapper';
import { updateMapData } from '@/features/atlas/api/mapService';

const AtlasEditorContext = createContext(null);

export const AtlasEditorProvider = ({ initialData, onSave, children }) => {
	const normalizedInitialState = useMemo(() => {
		return {
			...normalizeMapData(initialData),
			mapId: initialData.id,
			mapConfig: initialData.metadata || {},
		};
	}, [initialData]);

	const [state, dispatch] = useAtlasReducer(normalizedInitialState);
	const actions = useAtlasActions(dispatch);

	const saveMap = async () => {
		dispatch({ type: 'SET_SAVING', payload: true });
		try {
			const payload = serializeMapData(state);

			// CRITICAL: We also send the updated mapConfig (metadata)
			const configPayload = {
				...state.mapConfig,
				initialView: state.mapConfig.initialView,
			};

			if (onSave) {
				await onSave(payload, configPayload);
			} else {
				await updateMapData(state.mapId, payload, configPayload);
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
