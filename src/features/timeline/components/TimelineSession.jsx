import { Calendar, ChevronDown } from 'lucide-react';
import { TimelineEvent } from './TimelineEvent';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { clsx } from 'clsx';

// Estimated height of an event card to prevent massive layout shifts
const ESTIMATED_EVENT_HEIGHT = 120;

export const TimelineSession = memo(({ session, id, onToggle }) => {
	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useRef(null);
	const { isExpanded, hasActiveSearch } = session;

	useEffect(() => {
		if (!containerRef.current) return;
		if (!isExpanded) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{
				rootMargin: '600px 0px',
				threshold: 0,
			}
		);

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
		};
	}, [isExpanded]);

	const eventList = useMemo(() => {
		if (!isVisible) return null;
		return session.events.map((event) => <TimelineEvent key={event.id} event={event} id={event.id} />);
	}, [session.events, isVisible]);

	const placeholderHeight = session.events.length * ESTIMATED_EVENT_HEIGHT;

	return (
		<div id={id} ref={containerRef} className='relative pl-3 md:pl-12'>
			{/* Session Marker */}
			<div className='absolute -left-[11px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border shadow-sm z-10'>
				<div className='w-2 h-2 rounded-full bg-gray-400' />
			</div>

			{/* 
               FIX: Header Layout
               Removed flex-row columns. The chevron is now inline with the title.
            */}
			<div className='mb-6 group pl-5 md:pl-0'>
				{/* Metadata Row */}
				<div className='flex flex-wrap items-center gap-x-3 gap-y-1 mb-2'>
					<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border'>
						Session {session.number - 1}
					</span>
					<time className='text-xs text-muted-foreground/70 flex items-center gap-1 font-medium'>
						<Calendar size={12} /> {session.dateLabel}
					</time>
				</div>

				{/* Title Row with Inline Chevron */}
				<h2 className='text-xl md:text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight cursor-pointer'>
					{/* align-middle ensures text aligns with icon */}
					<span className='align-middle'>{session.title}</span>

					{!hasActiveSearch && (
						<span
							onClick={!hasActiveSearch ? onToggle : undefined}
							className={clsx(
								'inline-flex items-center justify-center align-middle ml-2 p-1 rounded-full text-muted-foreground/50 group-hover:bg-muted group-hover:text-foreground transition-all',
								isExpanded ? 'rotate-0' : '-rotate-90'
							)}>
							<ChevronDown size={20} />
						</span>
					)}
				</h2>

				{session.synopsis && (
					<div className='text-muted-foreground prose prose-sm prose-p:my-1 max-w-none text-pretty'>
						<SmartMarkdown>{session.synopsis}</SmartMarkdown>
					</div>
				)}
			</div>

			{/* Events List */}
			{isExpanded && (
				<div className='space-y-6 relative min-h-[50px] animate-in fade-in slide-in-from-top-2 duration-300'>
					{isVisible ? (
						eventList
					) : (
						<div
							style={{ height: placeholderHeight }}
							className='w-full rounded-lg border border-dashed border-border/50 bg-muted/20 flex items-center justify-center'>
							<span className='text-xs text-muted-foreground/50'>Loading {session.events.length} events...</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
});

TimelineSession.displayName = 'TimelineSession';
