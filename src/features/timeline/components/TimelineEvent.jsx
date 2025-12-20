import { clsx } from 'clsx';
import { MapPin, User } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';

export const TimelineEvent = ({ event }) => {
	const { Icon, container } = event.style;

	return (
		<div className='relative flex gap-4 group'>
			{/* Colored Icon Bubble */}
			<div
				className={clsx(
					'shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 z-10 transition-transform group-hover:scale-110',
					container
				)}>
				<Icon size={14} strokeWidth={2.5} />
			</div>

			{/* Content Card */}
			<div className='flex-1 -mt-1 pb-2'>
				<h4 className='text-sm font-bold text-gray-800 mb-1 flex items-center gap-2'>
					{event.title}
					<span className='text-[9px] font-normal uppercase tracking-wider text-gray-400 border border-border px-1.5 rounded-sm bg-muted'>
						{event.typeLabel}
					</span>
				</h4>

				{event.description && (
					<div className='text-sm text-gray-600 leading-relaxed text-pretty'>
						<SmartMarkdown>{event.description}</SmartMarkdown>
					</div>
				)}

				{/* Tags */}
				<div className='flex flex-wrap gap-2 mt-2'>
					{event.location && (
						<span className='inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 cursor-default'>
							<MapPin size={10} /> {event.location.name}
						</span>
					)}
					{event.npc && (
						<span className='inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 cursor-default'>
							<User size={10} /> {event.npc.name}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
