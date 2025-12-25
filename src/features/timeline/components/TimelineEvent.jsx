import { clsx } from 'clsx';
import { getEntityConfig } from '../../../config/entity'; // Use central config
import SmartMarkdown from '../../smart-text/SmartMarkdown';

export const TimelineEvent = ({ event }) => {
	const { Icon, container } = event.style;

	return (
		<div className='relative flex gap-4 group'>
			{/* Icon Bubble */}
			<div
				className={clsx(
					'shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 z-10 transition-transform group-hover:scale-110',
					container
				)}>
				<Icon size={14} strokeWidth={2.5} />
			</div>

			{/* Content */}
			<div className='flex-1 -mt-1 pb-2'>
				<h4 className='text-sm font-bold text-gray-800 mb-1 flex items-center gap-2'>
					{event.title}
					<span className='text-[9px] font-normal uppercase tracking-wider text-gray-800 border border-border px-1.5 rounded-sm bg-muted ml-auto'>
						{event.typeLabel}
					</span>
				</h4>

				{event.description && (
					<div className='text-sm text-gray-600 leading-relaxed text-pretty text-justify'>
						<SmartMarkdown>{event.description}</SmartMarkdown>
					</div>
				)}

				{/* Dynamic Tags - Refactored to use Entity Config */}
				{event.tags && event.tags.length > 0 && (
					<div className='flex flex-wrap gap-2 mt-2'>
						{event.tags.map((tag, idx) => {
							const config = getEntityConfig(tag.type);
							const TagIcon = config.icon;
							const styles = config.tailwind;

							return (
								<span
									key={`${tag.name}-${idx}`}
									className={clsx(
										'inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border cursor-default',
										// Use dynamic styles from config
										styles.bg,
										styles.text,
										styles.border
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
