import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');

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
		<SearchContext.Provider value={{ isOpen, query, setQuery, openSearch, closeSearch }}>
			{children}
		</SearchContext.Provider>
	);
};

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) throw new Error('useSearch must be used within SearchProvider');
	return context;
};
