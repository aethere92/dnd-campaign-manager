import { useState } from 'react';
import { clsx } from 'clsx';
import { BookOpen, FileText, History } from 'lucide-react';
import { useEntityViewModel } from './useEntityViewModel';
import { EntityHeader } from './components/EntityHeader';
import { EntitySidebar } from './components/EntitySidebar';
import { EntityBody, EntityHistory } from './components/EntityBody';

const Tabs = ({ active, onChange }) => {
	const tabs = [
		{ id: 'Narrative', icon: BookOpen },
		{ id: 'Summary', icon: FileText },
		{ id: 'Events', icon: History },
	];

	return (
		<div className='flex justify-center border-b border-border bg-muted/40'>
			{tabs.map((t) => {
				const Icon = t.icon;
				const isActive = active === t.id;
				return (
					<button
						key={t.id}
						onClick={() => onChange(t.id)}
						className={clsx(
							'flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all',
							isActive
								? 'border-amber-600 text-amber-700 bg-amber-50/50'
								: 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
						)}>
						<Icon size={14} className={isActive ? 'opacity-100' : 'opacity-70'} />
						{t.id}
					</button>
				);
			})}
		</div>
	);
};

export default function WikiEntityView({ entity }) {
	const viewModel = useEntityViewModel(entity);
	const [activeTab, setActiveTab] = useState('Narrative');

	if (!viewModel) return null;

	// Check if sidebar has any content
	const hasSidebar = viewModel.sidebar.traits.length > 0 || viewModel.sidebar.connections.length > 0;

	// --- LAYOUT STRATEGY: TABS (Sessions) ---
	if (viewModel.layoutMode === 'tabs') {
		return (
			<div className='pb-16 animate-in fade-in duration-300'>
				<EntityHeader data={viewModel.header} />

				<div className='sticky top-0 z-20 bg-background/95 backdrop-blur shadow-sm'>
					<Tabs active={activeTab} onChange={setActiveTab} />
				</div>

				<div className='max-w-6xl mx-auto px-4 py-8 min-h-[50vh]'>
					{activeTab === 'Narrative' && (
						<div className='max-w-3xl mx-auto'>
							<EntityBody summary={viewModel.content.narrative} sections={[]} history={null} />
						</div>
					)}

					{activeTab === 'Summary' && (
						<>
							{/* Conditional Layout based on Sidebar content */}
							{!hasSidebar ? (
								<div className='max-w-3xl mx-auto'>
									<EntityBody
										summary={viewModel.content.summary}
										sections={viewModel.content.sections}
										history={null}
									/>
								</div>
							) : (
								<div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
									<div className='lg:col-span-4 order-2 lg:order-1'>
										<EntitySidebar traits={viewModel.sidebar.traits} connections={viewModel.sidebar.connections} />
									</div>
									<div className='lg:col-span-8 order-1 lg:order-2'>
										<EntityBody
											summary={viewModel.content.summary}
											sections={viewModel.content.sections}
											history={null}
										/>
									</div>
								</div>
							)}
						</>
					)}

					{activeTab === 'Events' && (
						<div className='max-w-3xl mx-auto pt-2'>
							<EntityHistory events={viewModel.content.history} />
						</div>
					)}
				</div>
			</div>
		);
	}

	// --- LAYOUT STRATEGY: STANDARD (Entities) ---
	return (
		<div className='pb-16 animate-in fade-in duration-300'>
			<EntityHeader data={viewModel.header} />

			<div className='max-w-6xl mx-auto px-4 py-6'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
					{/* Conditional Sidebar Rendering */}
					{hasSidebar ? (
						<>
							<div className='lg:col-span-3'>
								<EntitySidebar traits={viewModel.sidebar.traits} connections={viewModel.sidebar.connections} />
							</div>
							<div className='lg:col-span-9'>
								<EntityBody
									summary={viewModel.content.summary}
									sections={viewModel.content.sections}
									history={viewModel.content.history}
								/>
							</div>
						</>
					) : (
						/* No Sidebar: Centered Content */
						<div className='lg:col-span-12 max-w-4xl mx-auto w-full'>
							<EntityBody
								summary={viewModel.content.summary}
								sections={viewModel.content.sections}
								history={viewModel.content.history}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
