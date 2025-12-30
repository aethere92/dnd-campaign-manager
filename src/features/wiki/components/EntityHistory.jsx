import { Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const EntityHistory = ({ events, showSession = true, fullHeight = true }) => {
	if (!events || events.length === 0) return null;

	return (
		// 1. Container Logic
		// If fullHeight is true, we allow the div to expand naturally.
		// If false, we clamp it to 600px with a scrollbar.
		<div className={clsx(!fullHeight && 'max-h-[600px] overflow-y-auto custom-scrollbar pr-2')}>
			{/* 2. Timeline Container */}
			{/* ml-5 pushes the border line right, creating a safe gutter for the dots (-left-[19px]) 
                so they don't get clipped by overflow:hidden or scroll containers */}
			<div className='border-l-2 border-border ml-2 pl-3 space-y-6 relative my-2'>
				{events.map((evt, idx) => (
					<div key={evt.id || idx} className='relative group'>
						{/* Timeline Dot */}
						<div
							className={clsx(
								'absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border border-background',
								'bg-stone-300 ring-1 ring-border',
								'group-hover:bg-accent group-hover:ring-accent/40 transition-colors shadow-sm'
							)}
						/>

						{/* Title Row with Session Badge */}
						<div className='flex items-center gap-2 mb-1 flex-wrap'>
							<h4 className='font-bold text-foreground text-sm mt-0.5'>{evt.title}</h4>
							{showSession && evt.session_number != null && (
								<span className='inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-auto max-w-[45%] truncate bg-stone-100 text-stone-500 border-stone-200/60'>
									<Calendar size={9} />
									Session {evt.session_number}
								</span>
							)}
						</div>

						{/* Description */}
						<div className='text-sm text-muted-foreground leading-relaxed text-justify'>
							<SmartMarkdown>{evt.description}</SmartMarkdown>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
