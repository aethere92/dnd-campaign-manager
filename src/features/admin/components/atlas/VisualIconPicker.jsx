import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown } from 'lucide-react';
import { ICON_MAP } from '@/features/atlas/utils/markerUtils';
import clsx from 'clsx';

export default function VisualIconPicker({ value, onChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [position, setPosition] = useState({ top: 0, left: 0, width: 260 });
	const buttonRef = useRef(null);

	const filteredIcons = Object.keys(ICON_MAP).filter((k) => k.toLowerCase().includes(search.toLowerCase()));

	// Default to 'default' if icon doesn't exist
	const activeKey = value && ICON_MAP[value] ? value : 'default';
	const ActiveIcon = ICON_MAP[activeKey] || ICON_MAP.default;

	// Handle Click Outside (Manual listener for Portal)
	useEffect(() => {
		const handleClick = (e) => {
			if (
				isOpen &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target) &&
				!e.target.closest('.icon-picker-portal')
			) {
				setIsOpen(false);
			}
		};
		window.addEventListener('mousedown', handleClick);
		return () => window.removeEventListener('mousedown', handleClick);
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const viewportH = window.innerHeight;
			const viewportW = window.innerWidth;

			const POPUP_H = 300;
			const POPUP_W = 260;

			// Vertical Flip
			let top = rect.bottom + 5;
			let transform = 'none';
			if (top + POPUP_H > viewportH) {
				top = rect.top - 5;
				transform = 'translateY(-100%)';
			}

			// Horizontal Shift
			let left = rect.left;
			if (left + POPUP_W > viewportW) {
				left = viewportW - POPUP_W - 10;
			}

			setPosition({ top, left, width: POPUP_W, transform });
		}
	}, [isOpen]);

	return (
		<div className='relative'>
			<button
				ref={buttonRef}
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 w-full p-2 border border-border rounded-md hover:bg-muted/50 transition-colors bg-background'>
				<div className='w-6 h-6 flex items-center justify-center bg-muted rounded border border-border/50 text-foreground'>
					<ActiveIcon size={14} />
				</div>
				<span className='text-xs font-medium text-muted-foreground flex-1 text-left capitalize truncate'>
					{activeKey}
				</span>
				<ChevronDown size={12} className='opacity-50' />
			</button>

			{isOpen &&
				createPortal(
					<div
						className='icon-picker-portal fixed z-[9999] bg-popover border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden'
						style={{
							top: position.top,
							left: position.left,
							width: position.width,
							maxHeight: '300px',
							transform: position.transform,
						}}>
						<div className='p-2 border-b border-border bg-popover z-10 flex gap-2'>
							<div className='relative flex-1'>
								<Search className='absolute left-2 top-2 text-muted-foreground' size={12} />
								<input
									autoFocus
									type='text'
									placeholder='Search...'
									className='w-full pl-7 pr-2 py-1.5 text-xs bg-muted/50 border border-border rounded focus:outline-none focus:border-primary'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>

						<div className='p-2 grid grid-cols-6 gap-1 overflow-y-auto custom-scrollbar bg-background'>
							{filteredIcons.map((key) => {
								const Icon = ICON_MAP[key];
								return (
									<button
										key={key}
										type='button'
										onClick={() => {
											onChange(key);
											setIsOpen(false);
										}}
										className={clsx(
											'aspect-square rounded flex items-center justify-center transition-all',
											activeKey === key
												? 'bg-primary text-primary-foreground shadow-sm scale-110'
												: 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
										)}
										title={key}>
										<Icon size={16} strokeWidth={2.5} />
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
