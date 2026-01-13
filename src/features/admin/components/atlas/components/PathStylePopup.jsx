import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings2, Minus, X } from 'lucide-react';
import clsx from 'clsx';

export default function PathStylePopup({ data, onChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const buttonRef = useRef(null);

	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setPosition({ top: rect.top, left: rect.left - 260 });
		}
	}, [isOpen]);

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
						className='fixed z-[9999] w-64 bg-card border border-border shadow-2xl rounded-xl p-4 animate-in fade-in zoom-in-95 duration-100'
						style={{ top: position.top, left: position.left }}>
						<div className='flex justify-between items-center mb-4 pb-2 border-b border-border'>
							<span className='font-bold text-xs'>Path Style</span>
							<button onClick={() => setIsOpen(false)}>
								<X size={14} className='text-muted-foreground' />
							</button>
						</div>
						{/* Width options */}
						<div className='mb-4'>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-2 block'>Width</label>
							<div className='flex gap-2 bg-muted/30 p-1 rounded-lg border border-border'>
								{[2, 5, 8, 12].map((w) => (
									<Btn key={w} active={data.weight === w} onClick={() => onChange('weight', w)}>
										<div style={{ height: w / 2, width: 12, backgroundColor: 'currentColor', borderRadius: 2 }} />
									</Btn>
								))}
							</div>
						</div>
						{/* Add other options (Curviness, Pattern, Opacity) here similar to original */}
					</div>,
					document.body
				)}
		</>
	);
}
