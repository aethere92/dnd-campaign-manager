import { clsx } from 'clsx';
import { Drawer } from '../../../components/ui/Drawer'; // Import generic
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar = ({ vm }) => {
	const { sidebarOpen, setSidebarOpen, campaign, navStructure, currentPath, navigateTo, onSwitchCampaign } = vm;

	const SidebarContent = () => (
		<div className='flex flex-col h-full bg-muted border-r border-border'>
			<SidebarHeader campaign={campaign} />
			<SidebarNav structure={navStructure} currentPath={currentPath} onNavigate={navigateTo} />
			<SidebarFooter onSwitch={onSwitchCampaign} />
		</div>
	);

	return (
		<>
			{/* Mobile: Generic Drawer */}
			<Drawer
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				title={campaign?.name || 'Menu'}
				position='left'
				className='w-72'>
				<div className='flex flex-col h-full bg-muted'>
					<SidebarHeader campaign={campaign} />
					<SidebarNav structure={navStructure} currentPath={currentPath} onNavigate={navigateTo} />
					<SidebarFooter onSwitch={onSwitchCampaign} />
				</div>
			</Drawer>

			{/* Desktop: Static Sidebar */}
			<aside className='hidden lg:flex w-64 flex-col h-full border-r border-border bg-muted shrink-0'>
				<SidebarContent />
			</aside>
		</>
	);
};
