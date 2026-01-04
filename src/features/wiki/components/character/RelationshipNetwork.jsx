import { clsx } from 'clsx';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import EntityLink from '@/domain/entity/components/EntityLink';
import EntityIcon from '@/domain/entity/components/EntityIcon';

const NetworkGroup = ({ type, items }) => {
	if (!items || items.length === 0) return null;

	const config = getEntityConfig(type);
	const Icon = config.icon;

	return (
		<div className='break-inside-avoid mb-6 bg-card/40 border border-border/40 rounded-lg overflow-hidden'>
			{/* Group Header */}
			<div className='px-3 py-2 border-b border-border/40 bg-muted/30 flex items-center justify-between'>
				<div
					className={clsx('flex items-center gap-2 text-xs font-bold uppercase tracking-widest', config.tailwind.text)}>
					<Icon size={14} /> {config.labelPlural}
				</div>
				<span className='text-[9px] font-bold bg-background border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground'>
					{items.length}
				</span>
			</div>

			{/* List of Connections */}
			<div className='p-2 space-y-1.5'>
				{items.map((rel) => (
					<EntityLink
						key={rel.entity_id}
						id={rel.entity_id}
						type={rel.entity_type}
						inline={true}
						showIcon={false}
						className={clsx(
							'!flex !w-full !items-center !justify-between !p-2 !rounded-md !border !bg-card !transition-all !cursor-pointer !no-underline',
							'!border-border hover:!border-primary/50 hover:!shadow-sm hover:!bg-muted/20 group'
						)}>
						{/* Left: Icon + Name */}
						<div className='flex items-center gap-2.5 flex-1 min-w-0'>
							<EntityIcon type={rel.entity_type} size={18} className='opacity-80 group-hover:opacity-100 shrink-0' />
							<span className='text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors'>
								{rel.entity_name}
							</span>
						</div>

						{/* Right: Relationship Label */}
						<span className='shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded ml-2 max-w-[40%] truncate'>
							{rel.type ? rel.type.replace(/_/g, ' ') : 'Related'}
						</span>
					</EntityLink>
				))}
			</div>
		</div>
	);
};

export const RelationshipNetwork = ({ relationships }) => {
	if (!relationships || relationships.length === 0) {
		return (
			<div className='p-8 text-center text-muted-foreground italic border border-dashed border-border rounded-lg bg-muted/20'>
				No connections recorded.
			</div>
		);
	}

	// 1. Group by Entity Type
	const groups = relationships.reduce((acc, rel) => {
		const type = rel.entity_type || 'default';
		if (!acc[type]) acc[type] = [];
		acc[type].push(rel);
		return acc;
	}, {});

	// 2. Define Display Order (Narrative Priority)
	const order = ['character', 'npc', 'faction', 'location', 'quest', 'encounter', 'item'];
	const orderedKeys = order.filter((k) => groups[k]).concat(Object.keys(groups).filter((k) => !order.includes(k)));

	// 3. Render Masonry Layout
	return (
		<div className='columns-1 md:columns-2 xl:columns-3 gap-6 animate-in fade-in duration-500'>
			{orderedKeys.map((type) => (
				<NetworkGroup key={type} type={type} items={groups[type]} />
			))}
		</div>
	);
};
