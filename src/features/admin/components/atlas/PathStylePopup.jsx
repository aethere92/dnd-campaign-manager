import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings2, Minus, X } from 'lucide-react';
import { PATH_STYLES } from '@/features/atlas/utils/pathUtils';
import clsx from 'clsx';

export default function PathStylePopup({ data, onChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const buttonRef = useRef(null);

	// Close on click outside
	useEffect(() => {
		const handleClick = (e) => {
			if (
				isOpen &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target) &&
				!e.target.closest('.path-style-portal')
			) {
				setIsOpen(false);
			}
		};
		window.addEventListener('mousedown', handleClick);
		return () => window.removeEventListener('mousedown', handleClick);
	}, [isOpen]);

	// Position logic
	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			// Position to the left of the button, aligned top
			setPosition({
				top: rect.top,
				left: rect.left - 260, // width of popup + margin
			});
		}
	}, [isOpen]);

	const OptionGroup = ({ label, children }) => (
		<div className='mb-4 last:mb-0'>
			<label className='text-[10px] font-bold uppercase text-muted-foreground mb-2 block'>{label}</label>
			<div className='flex gap-2 bg-muted/30 p-1 rounded-lg border border-border'>{children}</div>
		</div>
	);

	const Btn = ({ active, onClick, children }) => (
		<button
			type='button'
			onClick={onClick}
			className={clsx(
				'flex-1 h-8 rounded-md flex items-center justify-center transition-all border',
				active
					? 'bg-background border-primary text-primary shadow-sm'
					: 'bg-transparent border-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground'
			)}>
			{children}
		</button>
	);

	return (
		<>
			<button
				ref={buttonRef}
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='w-8 h-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors'>
				<Settings2 size={16} className='text-muted-foreground' />
			</button>

			{isOpen &&
				createPortal(
					<div
						className='path-style-portal fixed z-[9999] w-64 bg-card border border-border shadow-2xl rounded-xl p-4 animate-in fade-in zoom-in-95 duration-100'
						style={{ top: position.top, left: position.left }}>
						<div className='flex justify-between items-center mb-4 pb-2 border-b border-border'>
							<span className='font-bold text-xs'>Path Style</span>
							<button onClick={() => setIsOpen(false)}>
								<X size={14} className='text-muted-foreground' />
							</button>
						</div>

						{/* WIDTH */}
						<OptionGroup label='Width'>
							{[2, 5, 8, 12].map((w) => (
								<Btn key={w} active={data.weight === w} onClick={() => onChange('weight', w)}>
									<div style={{ height: w / 2, width: 12, backgroundColor: 'currentColor', borderRadius: 2 }} />
								</Btn>
							))}
						</OptionGroup>

						{/* CURVINESS */}
						<OptionGroup label='Curviness'>
							<Btn active={data.curviness === 0} onClick={() => onChange('curviness', 0)}>
								<Minus size={16} /> {/* Straight */}
							</Btn>
							<Btn active={data.curviness === 0.3} onClick={() => onChange('curviness', 0.3)}>
								<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M4 12c4 0 8-4 8-8' />
								</svg>
							</Btn>
							<Btn active={data.curviness === 0.8} onClick={() => onChange('curviness', 0.8)}>
								<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M4 20c8 0 16-16 16-16' />
								</svg>
							</Btn>
						</OptionGroup>

						{/* PATTERN */}
						<OptionGroup label='Pattern'>
							<Btn active={!data.dashArray} onClick={() => onChange('dashArray', '')}>
								<Minus size={16} />
							</Btn>
							<Btn active={data.dashArray === '12, 12'} onClick={() => onChange('dashArray', '12, 12')}>
								<div className='flex gap-1'>
									<div className='w-1.5 h-0.5 bg-current' />
									<div className='w-1.5 h-0.5 bg-current' />
								</div>
							</Btn>
							<Btn active={data.dashArray === '1, 8'} onClick={() => onChange('dashArray', '1, 8')}>
								<div className='flex gap-1'>
									<div className='w-0.5 h-0.5 bg-current rounded-full' />
									<div className='w-0.5 h-0.5 bg-current rounded-full' />
									<div className='w-0.5 h-0.5 bg-current rounded-full' />
								</div>
							</Btn>
						</OptionGroup>

						{/* OPACITY */}
						<OptionGroup label='Opacity'>
							{[0.3, 0.6, 1].map((o) => (
								<Btn key={o} active={data.opacity === o} onClick={() => onChange('opacity', o)}>
									<div className='w-3 h-3 rounded-sm bg-current' style={{ opacity: o }} />
								</Btn>
							))}
						</OptionGroup>
					</div>,
					document.body
				)}
		</>
	);
}
