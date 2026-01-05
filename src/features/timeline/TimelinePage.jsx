import { useTimelineViewModel } from './useTimelineView';
import { TimelineSession } from './components/TimelineSession';
import { TimelineArcHeader } from './components/TimelineArcHeader';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';
import { useMemo } from 'react';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

export default function TimelineView() {
	const { timelineItems, isLoading } = useTimelineViewModel();

	const tocItems = useMemo(() => {
		if (!timelineItems) return [];

		// Flatten the hierarchy into a linear list
		return timelineItems.flatMap((item) => {
			// LEVEL 1: Arc Header
			if (item.type === 'arc_header') {
				return [
					{
						id: `arc-marker-${item.id}`,
						text: item.title,
						depth: 1,
					},
				];
			}

			// LEVEL 2: Session
			if (item.type === 'session') {
				const sessionNode = {
					id: `session-marker-${item.number}`, // Ensure this ID exists in DOM
					text: item.title,
					depth: 2,
				};

				// LEVEL 3: Events (if they exist)
				const eventNodes = (item.events || []).map((event) => ({
					id: event.id, // The DOM element ID for the event card
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
											<TimelineArcHeader arc={item} id={`arc-${item.id}`} />
										</div>
									);
								}
								return (
									<div key={item.id} id={`session-marker-${item.number}`} className='scroll-mt-24'>
										<TimelineSession session={item} id={`session-${item.number}`} />
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
