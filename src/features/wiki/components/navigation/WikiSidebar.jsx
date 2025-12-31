import { useState } from 'react';
import { clsx } from 'clsx';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { WikiSidebarHeader } from './WikiSidebarHeader';
import { WikiSidebarList } from './WikiSidebarList';

export const WikiSidebar = ({ navigation, className }) => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [desktopCollapsed, setDesktopCollapsed] = useState(false);

	return (
		<>
			{/* COLLAPSED STATE (Slim Bar) */}
			{desktopCollapsed && (
				<div className='hidden lg:flex flex-col h-full border-l border-border bg-muted/50 w-10 shrink-0 z-30 transition-all duration-300 lg:order-2 items-center'>
					<div className='h-14 w-full flex items-center justify-center border-b border-border/50'>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setDesktopCollapsed(false);
							}}
							className='p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors'
							title='Expand Sidebar'>
							<PanelLeftClose size={18} />
						</button>
					</div>
				</div>
			)}

			{/* FULL SIDEBAR */}
			<div
				className={clsx(
					'flex flex-col bg-muted border-b border-border',
					'sticky top-0 w-full z-30', // Mobile
					'lg:static lg:border-b-0 lg:h-full lg:transition-all lg:duration-300', // Desktop
					desktopCollapsed
						? 'lg:w-0 lg:border-l-0 lg:overflow-hidden opacity-0 lg:opacity-100'
						: 'lg:w-72 lg:border-l lg:border-border',
					className
				)}>
				<WikiSidebarHeader
					config={navigation.config}
					search={navigation.search}
					onSearchChange={navigation.setSearch}
					onToggle={() => setMobileOpen(!mobileOpen)}
					isOpen={mobileOpen}
					renderDesktopToggle={() => (
						<button
							onClick={(e) => {
								// FIX: Stop propagation to prevent header click logic
								e.stopPropagation();
								setDesktopCollapsed(true);
							}}
							className='text-muted-foreground hover:text-primary transition-colors p-0.5 rounded'
							title='Collapse Sidebar'>
							<PanelLeftOpen size={18} />
						</button>
					)}
				/>

				{/* Content Wrapper */}
				<div
					className={clsx(
						'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
						'lg:flex lg:flex-col lg:flex-1 lg:min-h-0',
						mobileOpen ? 'grid-rows-[1fr] border-b border-border shadow-xl' : 'grid-rows-[0fr]'
					)}>
					<div className={clsx('overflow-hidden', 'lg:flex lg:flex-col lg:flex-1 lg:h-auto')}>
						<div
							className={clsx(
								'lg:flex-1 lg:min-h-0 lg:overflow-y-auto custom-scrollbar',
								mobileOpen && 'max-h-[70dvh] overflow-y-auto custom-scrollbar'
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

				{/* Mobile Backdrop */}
				<div
					className={clsx(
						'fixed inset-0 top-[110px] bg-black/40 z-[-1] lg:hidden backdrop-blur-[1px] transition-opacity duration-300',
						mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
					)}
					onClick={() => setMobileOpen(false)}
					style={{ touchAction: 'none' }}
				/>
			</div>
		</>
	);
};
