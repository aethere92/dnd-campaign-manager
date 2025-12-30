import { useState } from 'react';
import { clsx } from 'clsx';

/**
 * TabButton Component
 * Individual tab button
 */
function TabButton({ active, label, onClick, icon: Icon }) {
	return (
		<button
			onClick={onClick}
			className={clsx(
				'px-4 py-2 text-sm font-medium transition-all border-b-2 cursor-pointer',
				active
					? 'border-amber-600 text-amber-600 bg-amber-50/30'
					: 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
			)}>
			<span className='flex items-center gap-2'>
				{Icon && <Icon size={14} />}
				{label}
			</span>
		</button>
	);
}

/**
 * TabContainer Component
 * Reusable tab navigation system
 *
 * @param {Array<{id: string, label: string, icon?: Component, content: ReactNode}>} tabs - Tab definitions
 * @param {string} defaultTab - Default active tab ID
 * @param {string} className - Additional container classes
 * @param {boolean} sticky - Make tab bar sticky (default true)
 * @param {Function} onChange - Callback when tab changes
 */
export default function TabContainer({
	tabs,
	defaultTab = null,
	className = '',
	sticky = true,
	onChange = null,
	...props
}) {
	const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

	const handleTabChange = (tabId) => {
		setActiveTab(tabId);
		if (onChange) onChange(tabId);
	};

	const activeTabContent = tabs.find((t) => t.id === activeTab)?.content;

	return (
		<div className={clsx('flex flex-col', className)} {...props}>
			{/* Tab Bar */}
			<div
				className={clsx(
					'bg-background/95 backdrop-blur shadow-sm border-b border-border z-20',
					sticky && 'sticky top-0'
				)}>
				<div className='max-w-screen-2xl mx-auto px-6 flex justify-center'>
					{tabs.map((tab) => (
						<TabButton
							key={tab.id}
							active={activeTab === tab.id}
							label={tab.label}
							icon={tab.icon}
							onClick={() => handleTabChange(tab.id)}
						/>
					))}
				</div>
			</div>

			{/* Tab Content */}
			<div className='flex-1 min-h-0'>{activeTabContent}</div>
		</div>
	);
}

/**
 * TabPanel Component
 * Wrapper for individual tab content
 *
 * @param {React.ReactNode} children - Panel content
 * @param {string} className - Additional classes
 */
export function TabPanel({ children, className = '', ...props }) {
	return (
		<div className={clsx('p-6', className)} {...props}>
			{children}
		</div>
	);
}
