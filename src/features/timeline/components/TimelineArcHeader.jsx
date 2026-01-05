import { BookOpen } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const TimelineArcHeader = ({ arc }) => {
	return (
		// Container sits inside the border-l-2 parent.
		// pt-10: Space from previous session.
		// pb-1: Reduced space to the next session (tight coupling).
		<div className='relative pl-8 md:pl-12 pt-10 pb-1'>
			{/* "Chapter Marker" - Placed on the vertical line
			    -left-[19px] centers the 40px icon on the ~2px border line. */}
			<div className='absolute -left-[19px] top-10 flex items-center justify-center w-10 h-10 rounded-full bg-background border-4 border-primary/10 shadow-sm z-10 text-primary'>
				<BookOpen size={20} strokeWidth={2.5} />
			</div>

			{/* Content */}
			<div className='mb-2'>
				<span className='inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-2 border-b-2 border-primary/50 pb-1'>
					Narrative Arc
				</span>

				<h2 className='text-3xl md:text-4xl font-serif font-bold text-foreground mb-3'>{arc.title}</h2>

				{arc.description && (
					<div className='text-muted-foreground prose prose-sm prose-p:my-1 max-w-none text-pretty'>
						<SmartMarkdown>{arc.description}</SmartMarkdown>
					</div>
				)}
			</div>
		</div>
	);
};
