import { useMemo, memo } from 'react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { Diamond } from 'lucide-react';

export const TimelineEvent = memo(({ event, id }) => {
	const { Icon, container } = event.style;

	const groupedTags = useMemo(() => {
		if (!event.tags || event.tags.length === 0) return [];
		const groups = {};
		event.tags.forEach((tag) => {
			const type = tag.type || 'default';
			if (!groups[type]) groups[type] = [];
			groups[type].push(tag);
		});
		return Object.values(groups);
	}, [event.tags]);

	return (
		// FIX: Reduced gap on mobile (gap-2.5) to gap-4 on desktop
		<div className='relative flex gap-2.5 md:gap-4 group'>
			{/* Icon Bubble - Slightly smaller on mobile (w-7) */}
			<div
				className={clsx(
					'shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-sm border-2 z-10 transition-transform group-hover:scale-110 bg-background',
					container
				)}>
				<Icon className='w-3.5 h-3.5 md:w-4 md:h-4' strokeWidth={2.5} />
			</div>

			{/* Content */}
			<div id={id} className='flex-1 -mt-1 pb-2 min-w-0'>
				<h4 className='text-sm font-bold text-foreground/80 mb-1 flex flex-wrap items-center gap-2'>
					<span className='mr-auto'>{event.title}</span>
					{/* <span className='text-[9px] font-normal uppercase tracking-wider text-foreground border border-border px-1.5 rounded-sm bg-muted whitespace-nowrap'>
						{event.typeLabel}
					</span> */}
				</h4>

				{event.description && (
					<div className='text-sm text-muted-foreground leading-relaxed text-pretty text-left'>
						<SmartMarkdown>{event.description}</SmartMarkdown>
					</div>
				)}

				{groupedTags.length > 0 && (
					<div className='flex flex-wrap items-center gap-2 mt-2 px-2 py-1 bg-muted/60 rounded-sm w-fit max-w-full'>
						{groupedTags.map((group, groupIndex) => (
							<div key={groupIndex} className='flex items-center gap-2'>
								<div className='flex flex-wrap gap-2 text-[12px] text-muted-foreground/10'>
									<SmartMarkdown inline>{group.map((tag) => tag.name).join(' ')}</SmartMarkdown>
								</div>
								{groupIndex < groupedTags.length - 1 && (
									<Diamond size={6} className='text-muted-foreground fill-muted-foreground shrink-0' />
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
});

TimelineEvent.displayName = 'TimelineEvent';
