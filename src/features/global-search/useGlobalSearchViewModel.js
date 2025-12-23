import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '../campaign-session/CampaignContext';
import { globalSearch } from '../../services/search';
import { getEntityConfig } from '../../config/entity';
import { transformSearchResults } from './transforms/searchTransform'; // Import transform
import './types';

const STORAGE_KEY = 'recent-searches';

/**
 * @returns {import('./types').GlobalSearchViewModel}
 */
export function useGlobalSearchViewModel() {
	const navigate = useNavigate();
	const { campaignId } = useCampaign();
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
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

	// Transform results to view model
	const results = useMemo(() => {
		if (!rawData) return [];
		// Apply Transform Layer here
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
		const processedItems = transformSearchResults(rawData);
		return processedItems; // These have { id, name, type, description }
	}, [rawData]);

	// Transform recent searches to view model
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
		// Find the raw result from the flattened list
		const rawResult = flattenedRawResults.find((r) => r.id === result.id);

		if (rawResult) {
			// Store minimal data: id, name, type, description
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
			} catch {
				// Ignore storage errors
			}
		}

		// Navigate
		navigate(`/wiki/${result.type}/${result.id}`);

		// Reset state
		setIsOpen(false);
		setQuery('');
		setSelectedIndex(0);
	};

	// Clear recent searches
	const clearRecent = () => {
		setRecentSearches([]);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Ignore
		}
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			// ⌘K / Ctrl+K to open
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setIsOpen(true);
			}

			// ESC to close
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
				setQuery('');
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

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
		setIsOpen,
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
