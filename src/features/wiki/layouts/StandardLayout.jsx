import { Drawer } from 'vaul';
import { Info, X } from 'lucide-react';
import { EntitySidebar } from '@/features/wiki/components/EntitySidebar';
import { EntityBody } from '@/features/wiki/components/EntityBody';

export default function StandardLayout({ viewModel }) {
	if (!viewModel) return null;

	return (
		<div className='w-full px-4 sm:px-6 py-10'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-4 lg:gap-6 xl:gap-8'>
					{/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
					<div className='hidden lg:block lg:order-first min-w-0'>
						<EntitySidebar traits={viewModel.sidebar.traits} connections={viewModel.sidebar.connections} />
					</div>

					{/* --- MAIN CONTENT --- */}
					<div className='min-w-0 pb-20'>
						<EntityBody
							summary={viewModel.content.summary}
							sections={viewModel.content.sections}
							history={viewModel.content.history}
							objectives={viewModel.content.objectives}
							combatRounds={viewModel.content.combatRounds}
							mapImageUrl={viewModel.content.mapImageUrl}
						/>
					</div>
				</div>
			</div>

			{/* --- MOBILE BOTTOM SHEET --- */}
			<div className='lg:hidden'>
				<Drawer.Root shouldScaleBackground>
					<Drawer.Trigger asChild>
						<button className='fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-background text-foreground border border-stone-300 rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform'>
							<Info size={18} />
							<span>Info</span>
						</button>
					</Drawer.Trigger>

					<Drawer.Portal>
						<Drawer.Overlay className='fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]' />
						<Drawer.Content className='bg-background flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none border-t border-border'>
							{/* Drag Handle */}
							<div className='p-4 bg-muted/50 rounded-t-[10px] flex-shrink-0'>
								<div className='mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4' />
								<div className='flex justify-between items-center'>
									{/* CHANGED: Used Drawer.Title instead of h2 for accessibility */}
									<Drawer.Title className='font-serif font-bold text-xl'>Details & Stats</Drawer.Title>
									<Drawer.Close className='p-2 bg-gray-100 rounded-full text-gray-500'>
										<X size={16} />
									</Drawer.Close>
								</div>
							</div>

							{/* Content */}
							<div className='p-4 bg-background flex-1 overflow-y-auto custom-scrollbar'>
								<EntitySidebar traits={viewModel.sidebar.traits} connections={viewModel.sidebar.connections} />
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>
			</div>
		</div>
	);
}
