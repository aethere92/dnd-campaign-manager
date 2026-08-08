import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import EntityLink from '@/domain/entity/components/EntityLink';
import MasonryGrid from '@/shared/components/layout/MasonryGrid';

const MentionGroup = ({ type, items }) => {
	const config = getEntityConfig(type);
	const Icon = config.icon;

	return (
		<div className='break-inside-avoid mb-4 border border-border rounded-lg overflow-hidden bg-muted/30 flex flex-col'>
			{/* Header */}
			<div className='px-3 py-2 border-b border-border bg-muted/50 flex items-center justify-between shrink-0'>
				<div className='flex items-center gap-2'>
					<Icon size={12} className='text-muted-foreground' />
					<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest m-0'>
						{config.labelPlural}
					</h3>
				</div>
				<span className='text-[9px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full'>
					{items.length}
				</span>
			</div>

			{/* List Container */}
			<div className='p-2'>
				<div className='flex flex-col gap-1'>
					{items.map((item) => (
						<EntityLink key={item.id} variant='row' id={item.id} type={item.type}>
							{item.name}
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
			<div className='p-12 text-center text-muted-foreground italic border border-dashed border-border rounded-lg'>
				No linked entities found in this session.
			</div>
		);
	}

	const order = ['character', 'npc', 'location', 'faction', 'quest', 'encounter'];
	const orderedKeys = order.filter((k) => mentions[k]).concat(Object.keys(mentions).filter((k) => !order.includes(k)));

	return (
		<MasonryGrid columns={3} gap='md' className='animate-in fade-in duration-500'>
			{orderedKeys.map((key) => (
				<MentionGroup key={key} type={key} items={mentions[key]} />
			))}
		</MasonryGrid>
	);
};
