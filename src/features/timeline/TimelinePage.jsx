import { useTimelineViewModel } from './useTimelineView';
import { TimelineSession } from './components/TimelineSession';
import { TimelineArcHeader } from './components/TimelineArcHeader';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';
import { useMemo } from 'react';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { Search, ChevronsUp, ChevronsDown, X } from 'lucide-react';

export default function TimelineView() {
	const { timelineItems, isLoading, searchQuery, setSearchQuery, toggleSession, expandAll, collapseAll } =
		useTimelineViewModel();

	const tocItems = useMemo(() => {
		if (!timelineItems) return [];

		return timelineItems.flatMap((item) => {
			if (item.type === 'arc_header') {
				return [
					{
						id: `arc-marker-${item.id}`,
						text: item.title,
						depth: 1,
					},
				];
			}
			if (item.type === 'session') {
				const sessionNode = {
					id: `session-marker-${item.number}`,
					text: item.title,
					depth: 2,
				};
				if (!item.isExpanded) return [sessionNode];

				const eventNodes = (item.events || []).map((event) => ({
					id: event.id,
					text: event.title,
					depth: 3,
				}));
				return [sessionNode, ...eventNodes];
			}
			return [];
		});
	}, [timelineItems]);

	if (isLoading) return <LoadingSpinner className={`h-full min-h-[50vh]`} text='Loading Timeline...' fullScreen />;

	return (
		<div className='h-full overflow-hidden flex flex-col'>
			<div className='flex-1 overflow-y-auto bg-background custom-scrollbar'>
				<div className='max-w-7xl mx-auto p-4 md:p-12'>
					<div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10'>
						<h1 className='text-3xl font-serif font-bold text-foreground'>Campaign History</h1>

						{/* --- TOOLBAR --- */}
						<div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
							{/* Search Input */}
							<div className='relative w-full sm:w-64'>
								<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
								<input
									type='text'
									placeholder='Filter events...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='w-full h-9 pl-9 pr-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery('')}
										className='absolute right-2 top-2.5 text-muted-foreground hover:text-foreground'>
										<X size={14} />
									</button>
								)}
							</div>

							{/* Toggle Buttons */}
							<div className='flex items-center rounded-md border border-input bg-background shadow-sm h-9'>
								<button
									onClick={expandAll}
									className='flex-1 sm:flex-none px-3 h-full flex items-center gap-2 hover:bg-muted/50 transition-colors border-r border-input text-xs font-medium'
									title='Expand All'>
									<ChevronsDown size={14} /> <span className='sm:hidden lg:inline'>Expand</span>
								</button>
								<button
									onClick={collapseAll}
									className='flex-1 sm:flex-none px-3 h-full flex items-center gap-2 hover:bg-muted/50 transition-colors text-xs font-medium'
									title='Collapse All'>
									<ChevronsUp size={14} /> <span className='sm:hidden lg:inline'>Collapse</span>
								</button>
							</div>
						</div>
					</div>

					<div className='grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12 relative'>
						{/* 
                           Timeline Container 
                           FIX: Reduced mobile margin to ml-6 (24px) to give content more width.
                           The Arc Icon overhangs -21px. ml-6 + p-4 = 40px space. Safe.
                        */}
						<div className='relative border-l-2 border-border ml-3 md:ml-10 space-y-8 pb-20'>
							{timelineItems.length === 0 ? (
								<div className='py-20 text-center text-muted-foreground'>No events found matching "{searchQuery}"</div>
							) : (
								timelineItems.map((item) => {
									if (item.type === 'arc_header') {
										return (
											<div key={item.id} id={`arc-marker-${item.id}`} className='scroll-mt-12'>
												<TimelineArcHeader arc={item} id={`arc-${item.id}`} />
											</div>
										);
									}
									return (
										<div key={item.id} id={`session-marker-${item.number}`} className='scroll-mt-24'>
											<TimelineSession
												session={item}
												id={`session-${item.number}`}
												onToggle={() => toggleSession(item.id)}
											/>
										</div>
									);
								})
							)}
						</div>

						<TableOfContents items={tocItems} visibilityClass='hidden xl:block' mobileToggleClass='xl:hidden' />
					</div>
				</div>
			</div>
		</div>
	);
}
