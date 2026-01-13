import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';
import { LucideIcons, getAllIconNames } from '@/features/atlas/utils/markerUtils';
import clsx from 'clsx';

export default function VisualIconPicker({ value, onChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [position, setPosition] = useState(null);
	const [visibleCount, setVisibleCount] = useState(100);
	const buttonRef = useRef(null);
	const listRef = useRef(null);

	const ActiveIcon = LucideIcons[value] || LucideIcons.HelpCircle;
	const allIcons = useMemo(() => getAllIconNames(), []);

	const filteredIcons = useMemo(() => {
		const lower = search.toLowerCase();
		return allIcons.filter((k) => k.toLowerCase().includes(lower));
	}, [search, allIcons]);

	const displayIcons = filteredIcons.slice(0, visibleCount);

	const handleScroll = (e) => {
		const { scrollTop, scrollHeight, clientHeight } = e.target;
		if (scrollTop + clientHeight >= scrollHeight - 50) {
			setVisibleCount((prev) => Math.min(prev + 100, filteredIcons.length));
		}
	};

	useLayoutEffect(() => {
		setVisibleCount(100);
		if (listRef.current) listRef.current.scrollTop = 0;
	}, [search]);

	useLayoutEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const POPUP_W = 300;
			const POPUP_H = 360;

			let left = rect.left;
			if (left + POPUP_W > viewportWidth - 10) left = viewportWidth - POPUP_W - 10;

			let top = rect.bottom + 8;
			if (top + POPUP_H > viewportHeight) top = rect.top - POPUP_H - 8;

			setPosition({ top, left, width: POPUP_W });
		} else {
			setPosition(null);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const fn = (e) => {
			if (!e.target.closest('.icon-picker-portal') && !buttonRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		window.addEventListener('mousedown', fn);
		return () => window.removeEventListener('mousedown', fn);
	}, [isOpen]);

	return (
		<div className='relative w-full z-10'>
			{/* FIXED: Changed from button to div to prevent nesting error */}
			<div
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				role='button'
				tabIndex={0}
				className='flex items-center gap-3 w-full p-2.5 border border-border rounded-lg hover:bg-muted/50 transition-colors bg-card text-left group cursor-pointer'>
				<div className='w-8 h-8 flex items-center justify-center bg-muted rounded-md border border-border/50 text-foreground group-hover:border-primary/50 transition-colors shrink-0'>
					<ActiveIcon size={16} />
				</div>

				<div className='flex-1 min-w-0'>
					<div className='text-[10px] uppercase font-bold text-muted-foreground'>Icon</div>
					<div className='text-xs font-semibold truncate'>{value || 'Select...'}</div>
				</div>

				{/* Clear Button */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						onChange('default');
					}}
					className='text-muted-foreground hover:text-red-500 hidden group-hover:block p-1'
					title='Clear Icon'
					type='button'>
					<X size={14} />
				</button>

				<ChevronDown size={14} className='text-muted-foreground opacity-50 block group-hover:hidden' />
			</div>

			{isOpen &&
				position &&
				createPortal(
					<div
						className='icon-picker-portal fixed z-[9999] bg-popover border border-border shadow-2xl rounded-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100'
						style={{ top: position.top, left: position.left, width: position.width, maxHeight: '360px', opacity: 1 }}>
						<div className='p-3 border-b border-border bg-muted/30'>
							<div className='relative'>
								<Search className='absolute left-2.5 top-2.5 text-muted-foreground' size={14} />
								<input
									autoFocus
									type='text'
									placeholder='Search icons...'
									className='w-full pl-8 pr-8 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								{search && (
									<button
										onClick={() => setSearch('')}
										className='absolute right-2 top-2.5 text-muted-foreground hover:text-foreground'>
										<X size={12} />
									</button>
								)}
							</div>
						</div>

						<div
							ref={listRef}
							onScroll={handleScroll}
							className='p-2 grid grid-cols-6 gap-1 overflow-y-auto custom-scrollbar bg-card content-start h-full'>
							{displayIcons.map((key) => {
								const Icon = LucideIcons[key];
								return (
									<button
										key={key}
										type='button'
										onClick={() => {
											onChange(key);
											setIsOpen(false);
										}}
										className={clsx(
											'aspect-square rounded-md flex items-center justify-center transition-all',
											value === key
												? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
												: 'text-muted-foreground hover:bg-muted hover:text-foreground'
										)}
										title={key}>
										<Icon size={18} strokeWidth={value === key ? 2.5 : 2} />
									</button>
								);
							})}
						</div>
					</div>,
					document.body
				)}
		</div>
	);
}
