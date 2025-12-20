import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { WikiSidebarHeader } from './WikiSidebarHeader';
import { WikiSidebarList } from './WikiSidebarList';

export const WikiSidebar = ({ navigation, className }) => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const containerRef = useRef(null);

	const toggleOpen = () => setMobileOpen(!mobileOpen);
	const close = () => setMobileOpen(false);

	// Click outside to close (UX improvement)
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setMobileOpen(false);
			}
		};
		if (mobileOpen) document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [mobileOpen]);

	return (
		<div
			ref={containerRef}
			className={clsx(
				// Base styling matching the app's sidebar aesthetic
				'bg-muted border-b border-border flex flex-col transition-all',
				// Mobile: sticky top
				'sticky top-0 w-full',
				// Desktop: static height, reset sticky
				'lg:static lg:border-b-0',
				className
			)}>
			{/* HEADER: Always visible */}
			<WikiSidebarHeader
				config={navigation.config}
				search={navigation.search}
				onSearchChange={navigation.setSearch}
				onToggle={toggleOpen}
				isOpen={mobileOpen}
			/>

			{/* LIST CONTAINER */}
			<div
				className={clsx(
					// Mobile: Absolute dropdown floating over content
					'absolute top-full left-0 right-0 bg-muted border-b border-border shadow-xl',
					'max-h-[60vh] overflow-y-auto',
					// Desktop: Static flex column taking remaining height
					'lg:static lg:shadow-none lg:border-0 lg:max-h-full lg:flex-1 lg:flex lg:flex-col',
					// Visibility Toggle
					mobileOpen ? 'block' : 'hidden lg:flex'
				)}>
				<WikiSidebarList
					groups={navigation.groups}
					isLoading={navigation.isLoading}
					hasItems={navigation.hasItems}
					config={navigation.config}
					onItemClick={close} // Ensures clicking a link closes the dropdown
				/>
			</div>

			{/* Mobile Backdrop (Visual Dimming only, click handling done via Ref) */}
			{mobileOpen && <div className='fixed inset-0 bg-black/20 z-[-1] lg:hidden' />}
		</div>
	);
};
