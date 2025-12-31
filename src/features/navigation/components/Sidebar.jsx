import { clsx } from 'clsx';
import { Drawer } from '@/shared/components/ui/Drawer';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar = ({ vm }) => {
	const { sidebarOpen, setSidebarOpen, campaign, navStructure, currentPath, navigateTo, onSwitchCampaign } = vm;

	const SidebarContent = () => (
		// FIXED: Uses semantic colors
		<div className='flex flex-col h-full bg-muted border-r border-border'>
			<SidebarHeader campaign={campaign} />
			<SidebarNav structure={navStructure} currentPath={currentPath} onNavigate={navigateTo} />
			<SidebarFooter onSwitch={onSwitchCampaign} />
		</div>
	);

	return (
		<>
			{/* Mobile */}
			<Drawer
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				title={campaign?.name || 'Menu'}
				position='left'
				className='w-72'>
				<div className='flex flex-col h-full bg-muted'>
					{/* FIX: Pass onSearch to close sidebar when search is triggered on mobile */}
					<SidebarHeader campaign={campaign} onSearch={() => setSidebarOpen(false)} />
					<SidebarNav structure={navStructure} currentPath={currentPath} onNavigate={navigateTo} />
					<SidebarFooter onSwitch={onSwitchCampaign} />
				</div>
			</Drawer>

			{/* Desktop */}
			<aside className='hidden lg:flex w-64 flex-col h-full border-r border-border bg-muted shrink-0'>
				<SidebarContent />
			</aside>
		</>
	);
};
