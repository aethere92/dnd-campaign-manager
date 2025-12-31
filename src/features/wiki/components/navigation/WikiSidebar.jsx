import { useState } from 'react';
import { clsx } from 'clsx';
import { WikiSidebarHeader } from './WikiSidebarHeader';
import { WikiSidebarList } from './WikiSidebarList';

export const WikiSidebar = ({ navigation, className }) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div
			className={clsx(
				'flex flex-col bg-muted border-b border-border',
				'sticky top-0 w-full z-30', // Mobile Sticky
				'lg:static lg:border-b-0 lg:w-72 lg:order-2 lg:border-l lg:border-border lg:h-full', // Desktop Static
				className
			)}>
			<WikiSidebarHeader
				config={navigation.config}
				search={navigation.search}
				onSearchChange={navigation.setSearch}
				onToggle={() => setMobileOpen(!mobileOpen)}
				isOpen={mobileOpen}
			/>

			{/* 
                ANIMATION WRAPPER:
                Uses CSS Grid 0fr -> 1fr transition for smooth height animation 
                regardless of content size.
            */}
			<div
				className={clsx(
					'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
					// Desktop: Always open (1fr)
					// Mobile: Toggles between 0fr (closed) and 1fr (open)
					'lg:grid-rows-[1fr] lg:static lg:h-full',
					mobileOpen ? 'grid-rows-[1fr] border-b border-border shadow-xl' : 'grid-rows-[0fr]'
				)}>
				{/* Inner container must have overflow-hidden to hide content during collapse */}
				<div className='overflow-hidden'>
					<div
						className={clsx(
							'lg:h-full lg:overflow-y-auto',
							// Add max-height constraint on mobile only so it doesn't take up entire screen
							mobileOpen && 'max-h-[70dvh] overflow-y-auto'
						)}>
						<WikiSidebarList
							groups={navigation.groups}
							isLoading={navigation.isLoading}
							hasItems={navigation.hasItems}
							config={navigation.config}
							onItemClick={() => setMobileOpen(false)}
						/>
					</div>
				</div>
			</div>

			{/* Mobile Backdrop - Only shows when expanded to focus user on the menu */}
			<div
				className={clsx(
					'fixed inset-0 top-[110px] bg-black/40 z-[-1] lg:hidden backdrop-blur-[1px] transition-opacity duration-300',
					mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				)}
				onClick={() => setMobileOpen(false)}
				style={{ touchAction: 'none' }}
			/>
		</div>
	);
};
