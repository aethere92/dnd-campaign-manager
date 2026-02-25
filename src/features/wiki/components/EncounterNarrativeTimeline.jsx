import React from 'react';
import { BookOpen, Diamond } from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const EncounterNarrativeTimeline = ({ timeline }) => {
	if (!timeline || Object.keys(timeline).length === 0) return null;

	return (
		<div className='my-6 not-prose'>
			{/* Section Header (Matches Combat Log perfectly) */}
			<h3 className='text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2'>
				<BookOpen size={14} className='text-primary' /> Narrative Timeline
			</h3>

			{/* Main Container (Matches Combat Log perfectly) */}
			<div className='border border-border rounded-lg overflow-hidden bg-background shadow-sm'>
				{Object.entries(timeline).map(([roundNum, events], index, array) => (
					<div key={roundNum}>
						{/* Round Header */}
						<div className='bg-muted/80 border-b border-border px-4 py-2 flex items-center justify-between'>
							<span className='text-sm font-serif font-bold text-foreground'>Round {roundNum}</span>
							<span className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>
								{events.length} {events.length === 1 ? 'Event' : 'Events'}
							</span>
						</div>

						{/* Events Group */}
						<div
							className={clsx(
								'bg-background divide-y divide-border/40',
								index !== array.length - 1 && 'border-b border-border'
							)}>
							{events.map((evt, idx) => (
								<div
									key={idx}
									className='group flex items-start gap-3 px-4 py-3 text-[11pt] leading-relaxed text-foreground hover:bg-muted/40 transition-colors'>
									{/* Subtle bullet point matching EntityBody lists */}
									<div className='mt-[0.4rem] shrink-0 text-primary/40 group-hover:text-primary transition-colors'>
										<Diamond size={8} fill='currentColor' />
									</div>
									<div className='flex-1 min-w-0'>
										<SmartMarkdown components={{ p: 'span' }}>{evt.description}</SmartMarkdown>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};