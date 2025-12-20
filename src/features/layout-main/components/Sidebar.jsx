import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar = ({ vm }) => {
	const { sidebarOpen, setSidebarOpen, campaign, navStructure, currentPath, navigateTo, onSwitchCampaign } = vm;

	return (
		<>
			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={() => setSidebarOpen(false)} />
			)}

			<aside
				className={clsx(
					// FIXED: Replaced 'bg-[var(--sidebar-bg)]' with 'bg-muted' to ensure opacity
					'w-64 bg-muted border-r border-border flex flex-col h-full transition-transform duration-300 lg:translate-x-0',
					sidebarOpen ? 'translate-x-0' : '-translate-x-full',
					'fixed lg:relative z-50'
				)}>
				{/* Mobile Close Button */}
				<button
					onClick={() => setSidebarOpen(false)}
					className='lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-foreground hover:bg-gray-100 rounded-md'
					aria-label='Close sidebar'>
					<X size={20} />
				</button>

				<SidebarHeader campaign={campaign} />

				<SidebarNav structure={navStructure} currentPath={currentPath} onNavigate={navigateTo} />

				<SidebarFooter onSwitch={onSwitchCampaign} />
			</aside>
		</>
	);
};
