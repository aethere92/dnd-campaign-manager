import React, { useState, useEffect, useRef } from 'react';
import { searchEntitiesByName } from '@/features/admin/api/adminService'; // <--- NEW IMPORT
import { useCampaign } from '@/features/campaign/CampaignContext';
import { Search, X, Loader2 } from 'lucide-react';

export default function EntitySearch({ onSelect }) {
	const { campaignId } = useCampaign();
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const wrapperRef = useRef(null);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [wrapperRef]);

	useEffect(() => {
		const doSearch = async () => {
			if (query.length < 2) {
				setResults([]);
				return;
			}
			setIsLoading(true);
			try {
				// <--- USE NEW SERVICE HERE
				const flat = await searchEntitiesByName(campaignId, query);

				// Client-side Sorting: Exact Match > Starts With > Includes
				flat.sort((a, b) => {
					const nameA = (a.name || '').toLowerCase();
					const nameB = (b.name || '').toLowerCase();
					const q = query.toLowerCase();

					// 1. Exact Match Priority
					if (nameA === q && nameB !== q) return -1;
					if (nameB === q && nameA !== q) return 1;

					// 2. Starts With Priority
					if (nameA.startsWith(q) && !nameB.startsWith(q)) return -1;
					if (nameB.startsWith(q) && !nameA.startsWith(q)) return 1;

					// 3. Shortest Name Priority (Less noise)
					return nameA.length - nameB.length;
				});

				setResults(flat);
				setIsOpen(true);
			} catch (error) {
				console.error('Search failed', error);
			} finally {
				setIsLoading(false);
			}
		};

		const timeout = setTimeout(doSearch, 300);
		return () => clearTimeout(timeout);
	}, [query, campaignId]);

	const handleSelect = (item) => {
		onSelect(item);
		setQuery('');
		setIsOpen(false);
	};

	return (
		<div className='relative w-full' ref={wrapperRef}>
			{/* Label removed inside component for cleaner Bulk UI */}

			<div className='relative'>
				<input
					autoFocus
					type='text'
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						if (!isOpen) setIsOpen(true);
					}}
					placeholder='Search by name...'
					className='w-full pl-9 pr-8 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm transition-shadow'
				/>
				<Search className='absolute left-3 top-2.5 text-muted-foreground/60' size={14} />

				{query && (
					<button
						onClick={() => {
							setQuery('');
							setIsOpen(false);
						}}
						className='absolute right-2 top-2 text-muted-foreground hover:text-foreground p-0.5 rounded'>
						<X size={14} />
					</button>
				)}
			</div>

			{/* Dropdown Results */}
			{isOpen && (results.length > 0 || isLoading) && (
				<div className='absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100'>
					{isLoading ? (
						<div className='p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2'>
							<Loader2 size={14} className='animate-spin' /> Searching...
						</div>
					) : (
						results.map((item) => (
							<button
								key={item.id}
								type='button'
								onClick={() => handleSelect(item)}
								className='w-full text-left px-3 py-2 hover:bg-amber-50 border-b border-border/50 last:border-0 transition-colors group'>
								<div className='font-bold text-sm text-foreground group-hover:text-amber-800 truncate'>{item.name}</div>
								<div className='flex items-center gap-2'>
									<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 rounded group-hover:bg-amber-100/50'>
										{item.type}
									</span>
									{/* Description Snippet */}
									<span className='text-[10px] text-muted-foreground/60 truncate max-w-[200px]'>
										{item.description ? item.description.substring(0, 50) : ''}
									</span>
								</div>
							</button>
						))
					)}
				</div>
			)}

			{isOpen && !isLoading && results.length === 0 && query.length >= 2 && (
				<div className='absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-xl p-3 text-center text-xs text-muted-foreground'>
					No results for "{query}"
				</div>
			)}
		</div>
	);
}
