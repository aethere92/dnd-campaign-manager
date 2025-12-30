import { useMemo } from 'react';
import { clsx } from 'clsx';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { Diamond } from 'lucide-react';

export const TimelineEvent = ({ event }) => {
	const { Icon, container } = event.style;

	// Group tags by entity type
	const groupedTags = useMemo(() => {
		if (!event.tags || event.tags.length === 0) return [];

		const groups = {};
		event.tags.forEach((tag) => {
			const type = tag.type || 'default';
			if (!groups[type]) {
				groups[type] = [];
			}
			groups[type].push(tag);
		});

		// Convert to array of groups
		return Object.values(groups);
	}, [event.tags]);

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

				{/* Grouped Tags with Separators */}
				{groupedTags.length > 0 && (
					<div className='flex flex-wrap items-center gap-2 mt-2'>
						{groupedTags.map((group, groupIndex) => (
							<div key={groupIndex} className='flex items-center gap-2'>
								{/* Tags in this group */}
								<div className='flex flex-wrap gap-1.5'>
									{group.map((tag, idx) => {
										const config = getEntityConfig(tag.type);
										const TagIcon = config.icon;
										const styles = config.tailwind;

										return (
											<span
												key={`${tag.name}-${idx}`}
												className={clsx(
													'inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border cursor-default',
													styles.bg,
													styles.text,
													styles.border
												)}>
												<TagIcon size={10} /> {tag.name}
											</span>
										);
									})}
								</div>

								{/* Separator (except after last group) */}
								{groupIndex < groupedTags.length - 1 && (
									<Diamond size={6} className='text-gray-300 fill-gray-300 shrink-0' />
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
