/**
 * StandardLayout Component
 * Layout for NPCs, Locations, Items, Factions (sidebar + main content)
 */

import { EntitySidebar } from '../components/EntitySidebar';
import { EntityBody } from '../components/EntityBody';

/**
 * Standard entity layout with sidebar and main content
 * @param {Object} viewModel - Entity view model
 */
export default function StandardLayout({ viewModel }) {
	if (!viewModel) return null;

	return (
		<div className='w-full px-4 sm:px-6 py-10'>
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
							objectives={viewModel.content.objectives}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
