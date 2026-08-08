import { EntitySidebar } from '@/features/wiki/components/EntitySidebar';
import MobileInfoSheet from '@/shared/components/layout/MobileInfoSheet';
import { EntityBody } from '@/features/wiki/components/EntityBody';

export default function StandardLayout({ viewModel }) {
	if (!viewModel) return null;
	return (
		<div className='w-full px-4 sm:px-6 py-10'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-4 lg:gap-6 xl:gap-8'>
					{/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
					<div className='hidden lg:block lg:order-first min-w-0'>
						<EntitySidebar
							entity={viewModel.raw}
							traits={viewModel.sidebar.traits}
							connections={viewModel.sidebar.connections}
						/>
					</div>

					{/* --- MAIN CONTENT --- */}
					<div className='min-w-0 pb-20'>
						<EntityBody
							summary={viewModel.content.summary}
							sections={viewModel.content.sections}
							history={viewModel.content.history}
							objectives={viewModel.content.objectives}
							combatRounds={viewModel.content.combatRounds}
							narrativeTimeline={viewModel.content.narrativeTimeline} // <-- ADDED THIS
							timelineMode={viewModel.content.timelineMode} // <-- ADDED THIS
							mapImageUrl={viewModel.content.mapImageUrl}
							mapMarkers={viewModel.content.mapMarkers}
						/>
					</div>
				</div>
			</div>

			<MobileInfoSheet title='Details & Stats'>
				<EntitySidebar
					entity={viewModel.raw}
					traits={viewModel.sidebar.traits}
					connections={viewModel.sidebar.connections}
				/>
			</MobileInfoSheet>
		</div>
	);
}
