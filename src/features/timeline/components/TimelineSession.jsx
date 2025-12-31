import { Calendar } from 'lucide-react';
import { TimelineEvent } from './TimelineEvent';

export const TimelineSession = ({ session }) => {
	return (
		// OPTIMIZATION: Reduced padding (pl-4) on mobile to maximize text width
		<div className='relative pl-4 md:pl-12'>
			{/* Session Marker (Circle on the main line) */}
			<div className='absolute -left-[9px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border shadow-sm z-10'>
				<div className='w-2 h-2 rounded-full bg-gray-400' />
			</div>

			{/* Session Header */}
			<div className='mb-8'>
				<div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2'>
					<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded self-start border border-border'>
						Session {session.number - 1}
					</span>
					<time className='text-xs text-muted-foreground/70 flex items-center gap-1 font-medium'>
						<Calendar size={12} /> {session.dateLabel}
					</time>
				</div>
				<h2 className='text-2xl font-serif font-bold text-foreground mb-3'>{session.title}</h2>
			</div>

			{/* Events List */}
			<div className='space-y-6 relative'>
				{/* Connector Line for events */}
				{/* Adjusted left position slightly to align with tighter padding if needed, 
                    but 15px centers it nicely within the w-8 icon (16px center) roughly */}
				<div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-muted -z-10' />

				{session.events.map((event) => (
					<TimelineEvent key={event.id} event={event} />
				))}
			</div>
		</div>
	);
};
