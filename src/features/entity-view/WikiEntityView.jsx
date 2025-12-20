import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { useEntityViewModel } from './useEntityViewModel';
import { EntityHeader } from './components/EntityHeader';
import { EntityBody, EntityHistory } from './components/EntityBody';
import { EntitySidebar } from './components/EntitySidebar';
import { extractHeaders } from '../table-of-contents/utils';
import { TableOfContents } from '../table-of-contents/TableOfContents';

const TabButton = ({ active, label, onClick }) => (
	<button
		onClick={onClick}
		className={clsx(
			'px-4 py-2 text-sm font-medium transition-all border-b-2 cursor-pointer',
			active
				? 'border-amber-600 text-amber-600 bg-amber-50/30'
				: 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
		)}>
		{label}
	</button>
);

export default function WikiEntityView({ entity }) {
	const viewModel = useEntityViewModel(entity);
	const [activeTab, setActiveTab] = useState('Narrative');

	const isTabs = viewModel?.layoutMode === 'tabs';

	const tocItems = useMemo(() => {
		// Only calculate ToC for Session Narrative to avoid overlap on standard pages
		if (isTabs && activeTab === 'Narrative' && viewModel?.content?.narrative) {
			return extractHeaders(viewModel.content.narrative);
		}
		return [];
	}, [activeTab, viewModel, isTabs]);

	if (!viewModel) return null;

	return (
		<div className='pb-16 animate-in fade-in duration-300 min-h-full'>
			{/* 1. Universal Header */}
			<EntityHeader data={viewModel.header} />

			{/* 2. Session-Specific Tab Bar */}
			{isTabs && (
				<div className='sticky top-0 z-20 bg-background/95 backdrop-blur shadow-sm border-b border-border'>
					<div className='max-w-screen-2xl mx-auto px-6 flex justify-center'>
						<TabButton active={activeTab === 'Narrative'} label='Narrative' onClick={() => setActiveTab('Narrative')} />
						<TabButton active={activeTab === 'Summary'} label='Summary' onClick={() => setActiveTab('Summary')} />
						<TabButton active={activeTab === 'Events'} label='Timeline' onClick={() => setActiveTab('Events')} />
					</div>
				</div>
			)}

			<div className='w-full px-4 sm:px-6 py-10'>
				{isTabs ? (
					/* SESSION LAYOUT: Fixed 3-Column Centered Text */
					<div className='grid grid-cols-1 xl:grid-cols-[1fr_48rem_1fr] gap-6 max-w-[1920px] mx-auto'>
						<div className='hidden xl:block' aria-hidden='true' />

						<div className='min-w-0'>
							{/* FIX: Center content on all screen sizes */}
							<div className='max-w-3xl mx-auto'>
								{activeTab === 'Narrative' && (
									<EntityBody summary={viewModel.content.narrative} sections={[]} history={null} />
								)}
								{activeTab === 'Summary' && (
									<EntityBody
										summary={viewModel.content.summary}
										sections={viewModel.content.sections}
										history={null}
									/>
								)}
								{activeTab === 'Events' && <EntityHistory events={viewModel.content.history} />}
							</div>
						</div>

						{/* Table of Contents for Sessions only */}
						<div className='hidden xl:block'>
							{tocItems.length > 0 && <TableOfContents items={tocItems} className='ml-4' />}
						</div>
					</div>
				) : (
					/* STANDARD LAYOUT: NPC, Location, Item (Sidebar View) */
					<div className='max-w-6xl mx-auto'>
						<div className='grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-4 lg:gap-6 xl:gap-8'>
							{/* Sidebar */}
							<div className='lg:order-first min-w-0'>
								<EntitySidebar traits={viewModel.sidebar.traits} connections={viewModel.sidebar.connections} />
							</div>

							{/* Main Content */}
							<div className='min-w-0'>
								<EntityBody
									summary={viewModel.content.summary}
									sections={viewModel.content.sections}
									history={viewModel.content.history}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Mobile ToC Drawer */}
			{tocItems.length > 0 && (
				<div className='xl:hidden'>
					<TableOfContents items={tocItems} />
				</div>
			)}
		</div>
	);
}
