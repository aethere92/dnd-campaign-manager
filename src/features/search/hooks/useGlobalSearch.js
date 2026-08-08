import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { globalSearch } from '@/features/search/api/searchService';
import { answerQuestion } from '@/features/search/api/answerService';
import { parseQuery } from '@/features/search/utils/queryParser';
import { rankResults } from '@/features/search/utils/rankResults';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { transformSearchResults } from '@/features/search/utils/searchMapper';
import { useSearch } from '@/features/search/SearchContext';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { storage, STORAGE_KEYS } from '@/shared/utils/storage';

/** Map a raw search result to the shape SearchResultItem expects. */
const toViewModel = (result) => {
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
};

export function useGlobalSearch() {
	const navigate = useNavigate();
	const routes = useCampaignRoutes();
	const { campaignId } = useCampaign();

	const { isOpen, openSearch: setIsOpen, closeSearch, query, setQuery } = useSearch();

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [recentSearches, setRecentSearches] = useState(() => storage.getJSON(STORAGE_KEYS.RECENT_SEARCHES, []));

	// Classify the query: a recognised question shape, or plain keyword search.
	const parsed = useMemo(() => parseQuery(query), [query]);
	const isQuestion = parsed?.kind === 'question';

	// Structured answer (only fires for recognised questions).
	const { data: answer, isFetching: answerLoading } = useQuery({
		queryKey: ['searchAnswer', campaignId, parsed?.pattern, JSON.stringify(parsed?.slots)],
		queryFn: () => answerQuestion(campaignId, parsed),
		enabled: !!campaignId && isQuestion,
		staleTime: 1000 * 30,
	});

	// Keyword search. Skipped when the query is a question, so the two don't fight.
	const { data: rawData, isLoading } = useQuery({
		queryKey: ['globalSearch', campaignId, query],
		queryFn: () => globalSearch(campaignId, query),
		enabled: !!campaignId && query.trim().length > 0 && !isQuestion,
		staleTime: 1000 * 30,
	});

	const flattenedRawResults = useMemo(() => (rawData ? transformSearchResults(rawData) : []), [rawData]);
	// Rank by relevance (most query words matched, name over description) before
	// building view models, so the strongest match is first.
	const results = useMemo(() => rankResults(flattenedRawResults, query).map(toViewModel), [flattenedRawResults, query]);
	const recentSearchesViewModel = useMemo(() => recentSearches.map(toViewModel), [recentSearches]);

	// useCallback so the keyboard effect below can depend on it rather than closing
	// over a stale copy — pressing Enter used to run the handler captured when the
	// results last changed.
	const handleSelect = useCallback(
		(result) => {
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
				storage.setJSON(STORAGE_KEYS.RECENT_SEARCHES, updated);
			}

			navigate(routes.wikiEntity(result.type, result.id));
			closeSearch();
			setSelectedIndex(0);
		},
		[flattenedRawResults, recentSearches, navigate, routes, closeSearch]
	);

	// Answer-card navigation: sessions and entities are both rows in `entities`,
	// so the wiki route works for either.
	const openSession = useCallback(
		(session) => {
			if (!session) return;
			navigate(routes.wikiEntity('session', session.id));
			closeSearch();
		},
		[navigate, routes, closeSearch]
	);

	const openEntity = useCallback(
		(entity) => {
			if (!entity) return;
			navigate(routes.wikiEntity(entity.type, entity.id));
			closeSearch();
		},
		[navigate, routes, closeSearch]
	);

	const clearRecent = () => {
		setRecentSearches([]);
		storage.remove(STORAGE_KEYS.RECENT_SEARCHES);
	};

	// Arrow keys to move through results, Enter to open the selected one.
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			if (e.key === 'Enter') {
				if (results[selectedIndex]) {
					e.preventDefault();
					handleSelect(results[selectedIndex]);
				}
				return;
			}
			if (results.length === 0) return;
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % results.length);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, results, selectedIndex, handleSelect]);

	return {
		isOpen,
		setIsOpen,
		closeSearch,
		query,
		setQuery,
		results,
		isLoading: isLoading || answerLoading,
		recentSearches: recentSearchesViewModel,
		selectedIndex,
		setSelectedIndex,
		handleSelect,
		clearRecent,
		// Structured-answer mode
		isQuestion,
		answer: isQuestion ? answer : null,
		openSession,
		openEntity,
	};
}
