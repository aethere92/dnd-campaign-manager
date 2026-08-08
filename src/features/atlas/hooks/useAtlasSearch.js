import { useState, useMemo } from 'react';

export const useAtlasSearch = (mapData) => {
	const [searchTerm, setSearchTerm] = useState('');

	const filteredData = useMemo(() => {
		if (!mapData) return null;

		const term = searchTerm.toLowerCase();
		const filterFn = (item) => item.label && item.label.toLowerCase().includes(term);

		return {
			groups: mapData.groups
				.map((g) => ({
					...g,
					items: g.items.filter(filterFn),
				}))
				.filter((g) => g.items.length > 0),

			sessions: mapData.sessions.filter((s) => s.name.toLowerCase().includes(term)),

			overlays: mapData.overlays.filter((o) => o.name.toLowerCase().includes(term)),

			areas: (mapData.areas || []).filter((a) => a.label && a.label.toLowerCase().includes(term)),
		};
	}, [mapData, searchTerm]);

	return { searchTerm, setSearchTerm, filteredData };
};
