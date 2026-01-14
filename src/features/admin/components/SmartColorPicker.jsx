import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Pipette, Plus } from 'lucide-react';
import clsx from 'clsx';

// Extended Palette matching the requested style (Grayscale + Vibrants + Pastels)
const PRESETS = [
	// Row 1: Grays & White
	[
		'#ffffff',
		'#f8fafc',
		'#e2e8f0',
		'#cbd5e1',
		'#94a3b8',
		'#64748b',
		'#475569',
		'#334155',
		'#1e293b',
		'#0f172a',
		'#000000',
	],
	// Row 2: Reds / Oranges
	[
		'#fef2f2',
		'#fee2e2',
		'#fecaca',
		'#fca5a5',
		'#f87171',
		'#ef4444',
		'#dc2626',
		'#b91c1c',
		'#991b1b',
		'#7f1d1d',
		'#450a0a',
	],
	// Row 3: Ambers / Yellows
	[
		'#fffbeb',
		'#fef3c7',
		'#fde68a',
		'#fcd34d',
		'#fbbf24',
		'#f59e0b',
		'#d97706',
		'#b45309',
		'#92400e',
		'#78350f',
		'#451a03',
	],
	// Row 4: Greens
	[
		'#f0fdf4',
		'#dcfce7',
		'#bbf7d0',
		'#86efac',
		'#4ade80',
		'#22c55e',
		'#16a34a',
		'#15803d',
		'#166534',
		'#14532d',
		'#052e16',
	],
	// Row 5: Blues
	[
		'#eff6ff',
		'#dbeafe',
		'#bfdbfe',
		'#93c5fd',
		'#60a5fa',
		'#3b82f6',
		'#2563eb',
		'#1d4ed8',
		'#1e40af',
		'#1e3a8a',
		'#172554',
	],
	// Row 6: Purples / Pinks
	[
		'#faf5ff',
		'#f3e8ff',
		'#e9d5ff',
		'#d8b4fe',
		'#c084fc',
		'#a855f7',
		'#9333ea',
		'#7e22ce',
		'#6b21a8',
		'#581c87',
		'#3b0764',
	],
];

export default function SmartColorPicker({ value, onChange, className }) {
	const [isOpen, setIsOpen] = useState(false);
	const [hex, setHex] = useState(value || '#000000');
	const buttonRef = useRef(null);
	const [position, setPosition] = useState({ top: 0, left: 0 });

	useEffect(() => {
		setHex(value || '#000000');
	}, [value]);

	// Update position when opening
	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			// Position bottom-left of button, clamping to viewport if needed
			const top = rect.bottom + 8;
			const left = Math.min(rect.left, window.innerWidth - 320);
			setPosition({ top, left });
		}
	}, [isOpen]);

	// Close on outside click
	useEffect(() => {
		if (!isOpen) return;
		const fn = (e) => {
			if (!e.target.closest('.color-picker-portal') && !buttonRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		window.addEventListener('mousedown', fn);
		return () => window.removeEventListener('mousedown', fn);
	}, [isOpen]);

	const handleSelect = (c) => {
		setHex(c);
		onChange(c);
		setIsOpen(false);
	};

	return (
		<>
			<div
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className={clsx(
					'flex items-center gap-2 bg-card border border-border rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors h-8 min-w-[100px]',
					className
				)}>
				<div
					className='w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0'
					style={{ backgroundColor: hex }}
				/>
				<span className='text-xs font-mono flex-1 truncate'>{hex}</span>
				<ChevronDown size={12} className='text-muted-foreground opacity-50' />
			</div>

			{isOpen &&
				createPortal(
					<div
						className='color-picker-portal fixed z-[9999] bg-popover border border-border shadow-2xl rounded-lg p-3 w-[300px]'
						style={{ top: position.top, left: position.left }}>
						<div className='space-y-2'>
							{/* Preset Grid */}
							<div className='grid grid-cols-11 gap-1'>
								{PRESETS.flat().map((c) => (
									<button
										key={c}
										onClick={() => handleSelect(c)}
										className='w-5 h-5 rounded-[4px] hover:scale-125 transition-transform border border-black/5 relative group'
										style={{ backgroundColor: c }}
										title={c}>
										{/* Selected Indicator */}
										{c.toLowerCase() === hex.toLowerCase() && (
											<div className='absolute inset-0 flex items-center justify-center'>
												<div className='w-1.5 h-1.5 bg-white rounded-full shadow-sm ring-1 ring-black/20' />
											</div>
										)}
									</button>
								))}
							</div>

							<div className='h-px bg-border my-2' />

							{/* Manual Input */}
							<div className='flex gap-2'>
								<div className='relative flex-1'>
									<div className='absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'>#</div>
									<input
										value={hex.replace('#', '')}
										onChange={(e) => {
											const h = '#' + e.target.value;
											setHex(h);
											// Only fire change if valid hex
											if (/^#[0-9A-F]{6}$/i.test(h)) onChange(h);
										}}
										className='w-full bg-muted/50 border border-border rounded px-2 pl-5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary uppercase'
									/>
								</div>
								<div className='relative w-8 h-8 overflow-hidden rounded border border-border'>
									<input
										type='color'
										value={hex}
										onChange={(e) => {
											setHex(e.target.value);
											onChange(e.target.value);
										}}
										className='absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0'
									/>
									<div className='absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/50 bg-background/20 backdrop-blur-[1px]'>
										<Pipette size={14} />
									</div>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
