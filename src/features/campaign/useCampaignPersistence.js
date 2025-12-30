import { useState, useCallback } from 'react';

const STORAGE_KEY = 'campaignId';

// Safe wrapper for environments where localStorage might fail
const storage = {
	getItem: (key) => {
		try {
			return localStorage.getItem(key) || sessionStorage.getItem(key);
		} catch {
			return null;
		}
	},
	setItem: (key, value) => {
		try {
			localStorage.setItem(key, value);
		} catch {
			sessionStorage.setItem(key, value);
		}
	},
	removeItem: (key) => {
		try {
			localStorage.removeItem(key);
			sessionStorage.removeItem(key);
		} catch {
			// ignore
		}
	},
};

export function useCampaignPersistence() {
	const [campaignId, setCampaignIdState] = useState(() => {
		return storage.getItem(STORAGE_KEY) || null;
	});

	const setCampaignId = useCallback((id) => {
		setCampaignIdState(id);
		if (id) {
			storage.setItem(STORAGE_KEY, id);
		} else {
			storage.removeItem(STORAGE_KEY);
		}
	}, []);

	return { campaignId, setCampaignId };
}
