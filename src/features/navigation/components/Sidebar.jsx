import { Drawer } from '@/shared/components/ui/Drawer';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar = ({ vm }) => {
	const { sidebarOpen, setSidebarOpen, campaign, navStructure, currentPath, navigateTo, onSwitchCampaign } = vm;

	// Inlined rather than declared as a local component. A component defined in a
	// render body is a new type on every render, so React unmounts and remounts it
	// and any state inside is lost. It was only used once, so inlining is simpler
	// than hoisting.
	const content = (onSearch) => (
		<div className='flex flex-col h-full bg-muted'>
			<SidebarHeader campaign={campaign} onSearch={onSearch} />
			<SidebarNav structure={navStructure} currentPath={currentPath} onNavigate={navigateTo} />
			<SidebarFooter onSwitch={onSwitchCampaign} />
		</div>
	);

	return (
		<>
			{/* Mobile — onSearch closes the drawer when search is triggered */}
			<Drawer
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				title={campaign?.name || 'Menu'}
				position='left'
				className='w-72'>
				{content(() => setSidebarOpen(false))}
			</Drawer>

			{/* Desktop */}
			<aside className='hidden lg:flex w-64 flex-col h-full border-r border-border bg-muted shrink-0'>
				{content(undefined)}
			</aside>
		</>
	);
};
