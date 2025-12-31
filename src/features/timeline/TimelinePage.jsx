import { useTimelineViewModel } from './useTimelineView';
import { TimelineSession } from './components/TimelineSession';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';

export default function TimelineView() {
	const { sessions, isLoading } = useTimelineViewModel();

	if (isLoading) return <div className='p-8 text-center text-gray-400'>Loading timeline...</div>;

	// Construct ToC items manually for the timeline sessions
	const tocItems = sessions.map((s) => ({
		id: `session-marker-${s.number}`,
		text: `${s.title}`,
		depth: 1,
	}));

	return (
		<div className='h-full overflow-hidden flex flex-col'>
			<div className='flex-1 overflow-y-auto bg-background custom-scrollbar'>
				{/* OPTIMIZATION: Reduced padding on mobile (p-4 vs p-12) */}
				<div className='max-w-7xl mx-auto p-4 md:p-12'>
					<h1 className='text-3xl font-serif font-bold text-foreground mb-10'>Campaign History</h1>

					<div className='grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12 relative'>
						{/* Column 1: Timeline Content */}
						{/* OPTIMIZATION: Reduced margin-left (ml-3) for more width */}
						<div className='relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-16 pb-20'>
							{sessions.map((session) => (
								<div key={session.id} id={`session-marker-${session.number}`} className='scroll-mt-24'>
									<TimelineSession session={session} />
								</div>
							))}
						</div>

						{/* Column 2: ToC */}
						<TableOfContents items={tocItems} visibilityClass='hidden xl:block' mobileToggleClass='xl:hidden' />
					</div>
				</div>
			</div>
		</div>
	);
}
