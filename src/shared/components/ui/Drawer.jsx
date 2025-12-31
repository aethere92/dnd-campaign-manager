import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

/**
 * Reusable Mobile Drawer
 */
export const Drawer = ({ isOpen, onClose, title, children, position = 'right', className }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			document.body.classList.add('drawer-open'); // Added this
		} else {
			setTimeout(() => {
				setIsVisible(false);
				document.body.classList.remove('drawer-open'); // Added this
			}, 300);
		}

		// Cleanup
		return () => document.body.classList.remove('drawer-open');
	}, [isOpen]);

	if (!isVisible && !isOpen) return null;

	const positionClasses = {
		right: 'right-0 top-0 bottom-0 border-l slide-in-from-right',
		left: 'left-0 top-0 bottom-0 border-r slide-in-from-left',
	};

	return createPortal(
		<div className='fixed inset-0 z-[10050] isolate'>
			{/* Backdrop */}
			<div
				className={clsx(
					'absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300',
					isOpen ? 'opacity-100' : 'opacity-0'
				)}
				onClick={onClose}
			/>

			{/* Panel */}
			<div
				className={clsx(
					'absolute w-80 bg-background shadow-2xl border-border flex flex-col transition-transform duration-300',
					positionClasses[position],
					isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full',
					className
				)}>
				{/* Header */}
				<div className='p-4 border-b border-border flex items-center justify-between bg-muted shrink-0'>
					<span className='text-sm font-serif font-bold text-foreground'>{title}</span>
					<button onClick={onClose} className='p-2 hover:bg-background/50 rounded-full transition-colors'>
						<X size={18} />
					</button>
				</div>

				{/* Content - No background, let children control */}
				<div className='flex-1 overflow-y-auto custom-scrollbar'>{children}</div>
			</div>
		</div>,
		document.body
	);
};
