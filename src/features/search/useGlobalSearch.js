import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { globalSearch } from '@/features/search/api/searchService';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { transformSearchResults } from '@/features/search/utils/searchMapper';
import { useSearch } from './SearchContext'; // IMPORT CONTEXT

const STORAGE_KEY = 'recent-searches';

export function useGlobalSearchViewModel() {
	const navigate = useNavigate();
	const { campaignId } = useCampaign();

	// 1. Consume Context
	const { isOpen, openSearch: setIsOpen, closeSearch, query, setQuery } = useSearch();

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [recentSearches, setRecentSearches] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});

	// Fetch search results
	const { data: rawData, isLoading } = useQuery({
		queryKey: ['globalSearch', campaignId, query],
		queryFn: () => globalSearch(campaignId, query),
		enabled: !!campaignId && query.trim().length > 0,
		staleTime: 1000 * 30,
	});

	// Transform results
	const results = useMemo(() => {
		if (!rawData) return [];
		const processedItems = transformSearchResults(rawData);

		return processedItems.map((result) => {
			const config = getEntityConfig(result.type);
			return {
				id: result.id,
				name: result.name,
				type: result.type,
				typeLabel: result.type.toUpperCase(),
				description: result.description || '',
				icon: config.icon,
				theme: config.tailwind,
			};
		});
	}, [rawData]);

	const flattenedRawResults = useMemo(() => {
		if (!rawData) return [];
		return transformSearchResults(rawData);
	}, [rawData]);

	const recentSearchesViewModel = useMemo(() => {
		return recentSearches.map((result) => {
			const config = getEntityConfig(result.type);
			return {
				id: result.id,
				name: result.name,
				type: result.type,
				typeLabel: result.type.toUpperCase(),
				description: result.description || '',
				icon: config.icon,
				theme: config.tailwind,
			};
		});
	}, [recentSearches]);

	const handleSelect = (result) => {
		const rawResult = flattenedRawResults.find((r) => r.id === result.id);

		if (rawResult) {
			const toStore = {
				id: rawResult.id,
				name: rawResult.name,
				type: rawResult.type,
				description: rawResult.description || '',
			};
			const updated = [toStore, ...recentSearches.filter((r) => r.id !== toStore.id)].slice(0, 5);
			setRecentSearches(updated);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			} catch {}
		}

		navigate(`/wiki/${result.type}/${result.id}`);

		// Use Context Close
		closeSearch();
		setSelectedIndex(0);
	};

	const clearRecent = () => {
		setRecentSearches([]);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {}
	};

	// Arrow key navigation
	useEffect(() => {
		if (!isOpen || results.length === 0) return;

		const handleKeyDown = (e) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % results.length);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
			} else if (e.key === 'Enter' && results[selectedIndex]) {
				e.preventDefault();
				handleSelect(results[selectedIndex]);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, results, selectedIndex]);

	return {
		isOpen,
		setIsOpen, // Keeps API compatible with old components if they passed bool
		closeSearch, // New explicit close
		query,
		setQuery,
		results,
		isLoading,
		recentSearches: recentSearchesViewModel,
		selectedIndex,
		setSelectedIndex,
		handleSelect,
		clearRecent,
	};
}
