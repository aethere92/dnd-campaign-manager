import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { TocItem } from './TocItem';

export const TocMobileDrawer = ({ isOpen, items, activeId, onClose, onScrollTo }) => {
	if (!isOpen) return null;

	return createPortal(
		<div className='fixed inset-0 z-[9999] isolate'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200'
				onClick={onClose}
			/>

			{/* Drawer Panel */}
			<div className='absolute right-0 top-0 bottom-0 w-80 bg-background shadow-2xl border-l border-border animate-in slide-in-from-right duration-300 flex flex-col'>
				<div className='p-4 border-b border-border flex items-center justify-between bg-muted/30'>
					<span className='text-sm font-serif font-bold text-foreground'>Table of Contents</span>
					<button onClick={onClose} className='p-2 hover:bg-black/5 rounded-full transition-colors'>
						<X size={18} />
					</button>
				</div>

				<div className='flex-1 overflow-y-auto py-4 custom-scrollbar'>
					<div className='flex flex-col space-y-0.5'>
						{items.map((item) => (
							<TocItem key={item.id} item={item} isActive={activeId === item.id} onClick={onScrollTo} />
						))}
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
};
