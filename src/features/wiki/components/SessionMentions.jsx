import { clsx } from 'clsx';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import EntityLink from '@/domain/entity/components/EntityLink';
import EntityIcon from '@/domain/entity/components/EntityIcon';

const MentionGroup = ({ type, items }) => {
	const config = getEntityConfig(type);
	const Icon = config.icon;

	return (
		<div className='break-inside-avoid mb-4 border border-border rounded-lg overflow-hidden bg-muted/30/30 flex flex-col'>
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
						<EntityLink
							key={item.id}
							id={item.id}
							type={item.type}
							inline={true}
							showIcon={false}
							className={clsx(
								// Matches CharacterSidebar styling exactly
								'!flex !w-full !items-center !justify-between !p-2 !rounded-lg !border !bg-card/60 !transition-all !cursor-pointer !no-underline',
								'!border-border hover:!border-primary/40 hover:!shadow-sm hover:!bg-card group'
							)}>
							<div className='flex items-center gap-2.5 flex-1 min-w-0'>
								<EntityIcon
									type={item.type}
									size={16}
									className='opacity-80 group-hover:opacity-100 transition-opacity'
								/>
								<span className='text-xs font-semibold text-card-foreground truncate group-hover:text-foreground transition-colors'>
									{item.name}
								</span>
							</div>
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
		<div className='columns-1 md:columns-2 xl:columns-3 gap-4 animate-in fade-in duration-500'>
			{orderedKeys.map((key) => (
				<MentionGroup key={key} type={key} items={mentions[key]} />
			))}
		</div>
	);
};
