import { useTimelineViewModel } from './useTimelineViewModel';
import { TimelineSession } from './components/TimelineSession';

export default function TimelineView() {
	const { sessions, isLoading } = useTimelineViewModel();

	if (isLoading) {
		return <div className='p-8 text-gray-400 flex justify-center'>Loading timeline...</div>;
	}

	return (
		<div className='h-full overflow-y-auto bg-background p-6 md:p-12'>
			<div className='max-w-4xl mx-auto'>
				<h1 className='text-3xl font-serif font-bold text-foreground mb-10'>Campaign History</h1>

				{/* Continuous vertical line for the whole campaign */}
				<div className='relative border-l-2 border-gray-100 ml-4 space-y-16 pb-20'>
					{sessions.map((session) => (
						<TimelineSession key={session.id} session={session} />
					))}
				</div>
			</div>
		</div>
	);
}
