import { useState } from 'react';
import { clsx } from 'clsx';
import { WikiSidebarHeader } from './WikiSidebarHeader';
import { WikiSidebarList } from './WikiSidebarList';

export const WikiSidebar = ({ navigation, className }) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div
			className={clsx(
				'bg-muted border-b border-border flex flex-col transition-all',
				'sticky top-0 w-full z-30',
				'lg:static lg:border-b-0 lg:w-72 lg:order-2 lg:border-l lg:border-border lg:h-full',
				className
			)}>
			{/* Header - Always Visible */}
			<WikiSidebarHeader
				config={navigation.config}
				search={navigation.search}
				onSearchChange={navigation.setSearch}
				onToggle={() => setMobileOpen(!mobileOpen)}
				isOpen={mobileOpen}
			/>

			{/* Content - Collapsible on Mobile, Static on Desktop */}
			<div
				className={clsx(
					'bg-muted border-b border-border shadow-xl max-h-[60vh] overflow-y-auto',
					'lg:static lg:shadow-none lg:border-0 lg:max-h-full lg:flex-1 lg:flex lg:flex-col',
					// Mobile: Dropdown behavior
					mobileOpen ? 'absolute top-full left-0 right-0 block' : 'hidden lg:flex'
				)}>
				<WikiSidebarList
					groups={navigation.groups}
					isLoading={navigation.isLoading}
					hasItems={navigation.hasItems}
					config={navigation.config}
					onItemClick={() => setMobileOpen(false)}
				/>
			</div>

			{/* Mobile Backdrop (when expanded) */}
			{mobileOpen && (
				<div className='fixed inset-0 bg-black/20 z-[-1] lg:hidden' onClick={() => setMobileOpen(false)} />
			)}
		</div>
	);
};
