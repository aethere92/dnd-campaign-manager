import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

/**
 * Reusable Mobile Drawer with 60fps hardware-accelerated transitions
 */
export const Drawer = ({ isOpen, onClose, title, children, position = 'right', className }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			document.body.classList.add('drawer-open');
		} else {
			// Wait for animation to finish before unmounting DOM
			const timer = setTimeout(() => {
				setIsVisible(false);
				document.body.classList.remove('drawer-open');
			}, 350); // Slightly longer than CSS duration to ensure completion
			return () => clearTimeout(timer);
		}
		return () => document.body.classList.remove('drawer-open');
	}, [isOpen]);

	if (!isVisible && !isOpen) return null;

	// Slide directions
	const positionClasses = {
		right: 'right-0 top-0 bottom-0 border-l',
		left: 'left-0 top-0 bottom-0 border-r',
	};

	// Transform values
	const transforms = {
		right: isOpen ? 'translate-x-0' : 'translate-x-full',
		left: isOpen ? 'translate-x-0' : '-translate-x-full',
	};

	return createPortal(
		<div className='fixed inset-0 z-[10050] isolate'>
			{/* Backdrop - Fades in/out */}
			<div
				className={clsx(
					'absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out',
					isOpen ? 'opacity-100' : 'opacity-0'
				)}
				onClick={onClose}
				aria-hidden='true'
			/>

			{/* Panel - Slides with Physics Easing */}
			<div
				className={clsx(
					'absolute w-80 bg-background shadow-2xl border-border flex flex-col pb-safe',
					// Hardware acceleration hints
					'will-change-transform transition-transform duration-300',
					// iOS-like spring easing (cubic-bezier)
					'ease-[cubic-bezier(0.32,0.72,0,1)]',
					positionClasses[position],
					transforms[position],
					className
				)}>
				{/* Header */}
				<div className='p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-border flex items-center justify-between bg-muted shrink-0'>
					<span className='text-sm font-serif font-bold text-foreground'>{title}</span>
					<button
						onClick={onClose}
						className='p-2 -mr-2 hover:bg-background/50 rounded-full transition-colors active:scale-95 text-muted-foreground'
						aria-label='Close Sidebar'>
						<X size={20} />
					</button>
				</div>

				{/* Content */}
				<div className='flex-1 overflow-y-auto custom-scrollbar p-0'>{children}</div>
			</div>
		</div>,
		document.body
	);
};
