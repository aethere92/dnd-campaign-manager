import { useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { List, X } from 'lucide-react';
import { useTocObserver } from './useTocObserver';

export const TableOfContents = ({ items, className }) => {
	const [isOpen, setIsOpen] = useState(false);
	const activeId = useTocObserver(items.map((i) => i.id));

	if (!items || items.length === 0) return null;

	const handleScroll = (id) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			setIsOpen(false);
		}
	};

	const Content = ({ isMobile = false }) => (
		<nav className={clsx('space-y-1', !isMobile && 'max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar')}>
			{items.map((item) => (
				<button
					key={item.id}
					onClick={() => handleScroll(item.id)}
					className={clsx(
						'block w-full text-left text-[11px] py-1.5 px-3 border-l-2 transition-all duration-200',
						activeId === item.id
							? 'border-accent text-accent font-bold bg-accent/5 translate-x-1'
							: 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200'
					)}>
					{item.text}
				</button>
			))}
		</nav>
	);

	// Mobile Drawer (Portal)
	const MobileDrawer = isOpen
		? createPortal(
				<div className='fixed inset-0 z-[9999] flex justify-end isolate'>
					<div
						className='absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300'
						onClick={() => setIsOpen(false)}
					/>
					<div className='relative w-72 bg-background h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-border'>
						<div className='flex justify-between items-center mb-8 border-b border-border pb-4'>
							<span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Table of Contents</span>
							<button onClick={() => setIsOpen(false)} className='p-2 hover:bg-muted rounded-full transition-colors'>
								<X size={20} />
							</button>
						</div>
						<Content isMobile />
					</div>
				</div>,
				document.body
		  )
		: null;

	return (
		<>
			{/* DESKTOP SIDEBAR */}
			<div className={clsx('hidden xl:block sticky top-24 self-start max-h-[calc(100vh-6rem)]', className)}>
				<Content />
			</div>

			{/* MOBILE / TABLET BUTTON */}
			<div className='xl:hidden'>
				<button
					onClick={() => setIsOpen(true)}
					className='fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-accent text-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 border-2 border-white'>
					<List size={18} />
				</button>
				{MobileDrawer}
			</div>
		</>
	);
};
