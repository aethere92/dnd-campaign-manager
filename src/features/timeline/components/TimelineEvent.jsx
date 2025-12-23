import { clsx } from 'clsx';
import { MapPin, User, Flag, Scroll, Skull, Box } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';

// Helper to get icon and style for tags based on entity type
const getTagConfig = (type) => {
	switch (type) {
		case 'location':
			return {
				Icon: MapPin,
				className: 'text-emerald-600 bg-emerald-50 border-emerald-100',
			};
		case 'npc':
		case 'character':
			return {
				Icon: User,
				className: 'text-amber-600 bg-amber-50 border-amber-100',
			};
		case 'faction':
			return {
				Icon: Flag,
				className: 'text-purple-600 bg-purple-50 border-purple-100',
			};
		case 'quest':
			return {
				Icon: Scroll,
				className: 'text-blue-600 bg-blue-50 border-blue-100',
			};
		case 'encounter':
			return {
				Icon: Skull,
				className: 'text-orange-600 bg-orange-50 border-orange-100',
			};
		default:
			return {
				Icon: Box,
				className: 'text-gray-500 bg-gray-100 border-gray-200',
			};
	}
};

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

				{/* Dynamic Tags from Relationships */}
				{event.tags && event.tags.length > 0 && (
					<div className='flex flex-wrap gap-2 mt-2'>
						{event.tags.map((tag, idx) => {
							const { Icon: TagIcon, className } = getTagConfig(tag.type);
							return (
								<span
									key={`${tag.name}-${idx}`}
									className={clsx(
										'inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border cursor-default',
										className
									)}>
									<TagIcon size={10} /> {tag.name}
								</span>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
