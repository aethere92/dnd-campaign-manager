import { clsx } from 'clsx';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import EntityLink from '@/domain/entity/components/EntityLink';
import EntityIcon from '@/domain/entity/components/EntityIcon';

const MentionGroup = ({ type, items }) => {
	const config = getEntityConfig(type);
	const Icon = config.icon;

	return (
		<div className='border border-stone-200 rounded-lg overflow-hidden bg-stone-50/30 flex flex-col'>
			{/* Header */}
			<div className='px-3 py-2 border-b border-stone-200 bg-stone-100/50 flex items-center justify-between shrink-0'>
				<div className='flex items-center gap-2'>
					<Icon size={12} className='text-stone-500' />
					<h3 className='text-[10px] font-bold text-stone-500 uppercase tracking-widest m-0'>{config.labelPlural}</h3>
				</div>
				<span className='text-[9px] font-bold text-stone-400 bg-stone-200/50 px-1.5 py-0.5 rounded-full'>
					{items.length}
				</span>
			</div>

			{/* List Container - Reverted to Vertical Column */}
			<div className='p-2'>
				<div className='flex flex-col gap-1.5'>
					{items.map((item) => (
						<EntityLink
							key={item.id}
							id={item.id}
							type={item.type}
							inline={true} // Use inline mode to get a cleaner DOM structure (A -> SPAN)
							showIcon={false} // We provide our own icon in the children for custom styling
							className={clsx(
								// Override generic InlineLink styles to make it look like a card
								'!block !w-full !no-underline !border',
								'!bg-white/60 !border-stone-200/80 !rounded-md',
								'!px-2 !py-1.5',
								// Colors
								'!text-stone-700 hover:!text-foreground',
								// Hover states
								'hover:!bg-white hover:!border-amber-300 hover:!shadow-sm transition-all'
							)}>
							{/* Inner Layout Wrapper to handle Flex behavior correctly */}
							<span className='flex items-center gap-2.5 min-w-0'>
								<EntityIcon type={item.type} size={14} className='opacity-70 text-stone-500 shrink-0' />
								<span className='text-[13px] font-semibold truncate'>{item.name}</span>
							</span>
						</EntityLink>
					))}
				</div>
			</div>
		</div>
	);
};

export const SessionMentions = ({ mentions }) => {
	if (!mentions || Object.keys(mentions).length === 0) {
		return (
			<div className='p-12 text-center text-stone-400 italic border border-dashed border-stone-200 rounded-lg'>
				No linked entities found in this session.
			</div>
		);
	}

	const order = ['character', 'npc', 'location', 'faction', 'quest', 'encounter'];
	const orderedKeys = order.filter((k) => mentions[k]).concat(Object.keys(mentions).filter((k) => !order.includes(k)));

	return (
		<div className='columns-1 md:columns-2 xl:columns-3 gap-4'>
			{orderedKeys.map((key) => (
				<div key={key} className='break-inside-avoid mb-4'>
					<MentionGroup type={key} items={mentions[key]} />
				</div>
			))}
		</div>
	);
};
