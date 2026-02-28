import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY_AI_MODE = 'search-ai-mode';
const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [aiMode, setAiMode] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY_AI_MODE) === 'true';
		} catch {
			return false;
		}
	});

	const toggleAiMode = useCallback(() => {
		setAiMode((prev) => {
			const next = !prev;
			try { localStorage.setItem(STORAGE_KEY_AI_MODE, String(next)); } catch {}
			return next;
		});
	}, []);

	// Keyboard shortcut listener (CMD+K)
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			}
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	const openSearch = useCallback(() => setIsOpen(true), []);
	const closeSearch = useCallback(() => {
		setIsOpen(false);
		setQuery(''); // Optional: clear query on close
	}, []);

	return (
		<SearchContext.Provider value={{ isOpen, query, setQuery, openSearch, closeSearch, aiMode, toggleAiMode }}>
			{children}
		</SearchContext.Provider>
	);
};

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) throw new Error('useSearch must be used within SearchProvider');
	return context;
};
