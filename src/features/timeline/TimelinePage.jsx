import { useTimelineViewModel } from './useTimelineView';
import { TimelineSession } from './components/TimelineSession';
import { TimelineArcHeader } from './components/TimelineArcHeader';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

export default function TimelineView() {
	const { timelineItems, isLoading } = useTimelineViewModel();

	if (isLoading) return <LoadingSpinner className={`h-full min-h-[50vh]`} text='Loading Timeline...' fullScreen />;

	// Hierarchical ToC
	const tocItems = timelineItems.map((item) => {
		if (item.type === 'arc_header') {
			return {
				id: `arc-marker-${item.id}`,
				text: item.title,
				depth: 1,
			};
		}
		return {
			id: `session-marker-${item.number}`,
			text: item.title,
			depth: 2,
		};
	});

	return (
		<div className='h-full overflow-hidden flex flex-col'>
			<div className='flex-1 overflow-y-auto bg-background custom-scrollbar'>
				<div className='max-w-7xl mx-auto p-4 md:p-12'>
					<h1 className='text-3xl font-serif font-bold text-foreground mb-10'>Campaign History</h1>

					<div className='grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12 relative'>
						{/* 
                           KEEPING THE BORDER: 
                           The border-l-2 creates the "timeline". 
                           Both Sessions and Arc Headers sit inside this, putting markers on the line.
                        */}
						<div className='relative border-l-2 border-border ml-3 md:ml-4 space-y-8 pb-20'>
							{timelineItems.map((item) => {
								if (item.type === 'arc_header') {
									return (
										<div key={item.id} id={`arc-marker-${item.id}`} className='scroll-mt-12'>
											<TimelineArcHeader arc={item} />
										</div>
									);
								}
								return (
									<div key={item.id} id={`session-marker-${item.number}`} className='scroll-mt-24'>
										<TimelineSession session={item} />
									</div>
								);
							})}
						</div>

						<TableOfContents items={tocItems} visibilityClass='hidden xl:block' mobileToggleClass='xl:hidden' />
					</div>
				</div>
			</div>
		</div>
	);
}
