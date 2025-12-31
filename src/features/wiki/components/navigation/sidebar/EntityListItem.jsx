import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { resolveEntityIcon } from '@/domain/entity/config/entityIcons'; // Import Central Config

export const EntityListItem = ({ item, showStatus, onItemClick }) => {
	const isQuest = item.type === 'quest';
	const hasPriority = isQuest && item.meta.priority;

	const iconUrl = resolveImageUrl(item.attributes, 'icon');
	const hasCustomIcon = !!iconUrl;

	// Use Centralized Resolver
	const ResolvedIcon = resolveEntityIcon({ type: item.type, attributes: item.attributes });

	// Determine if we show the icon.
	const shouldShowIcon = hasCustomIcon || !['quest', 'faction'].includes(item.type);

	return (
		<NavLink
			to={item.path}
			onClick={onItemClick}
			className={({ isActive }) =>
				clsx(
					'group flex items-center w-full text-left pl-6 pr-2 py-1 text-[13px] transition-colors',
					// FIX: Replaced 'bg-accent/10' with 'bg-primary/10' and text color for visibility
					isActive
						? 'bg-primary/10 text-primary font-bold'
						: 'text-foreground/80 hover:bg-black/5 hover:text-foreground'
				)
			}>
			{shouldShowIcon && (
				<span
					className={clsx(
						'shrink-0 flex items-center justify-center mr-2',
						!hasCustomIcon && 'opacity-70 text-muted-foreground',
						// Ensure icon inherits color when active
						hasCustomIcon ? '' : 'group-[.active]:text-primary'
					)}>
					{hasCustomIcon ? (
						<EntityIcon type={item.type} customIconUrl={iconUrl} size={16} className='rounded-full object-cover' />
					) : (
						<ResolvedIcon size={14} />
					)}
				</span>
			)}

			{showStatus && (
				<span
					className={clsx(
						'flex-shrink-0 flex items-center justify-center opacity-70',
						hasPriority ? 'mr-1' : 'mr-2',
						!shouldShowIcon && 'ml-[-2px]'
					)}>
					<StatusIcon entity={item} />
				</span>
			)}

			{hasPriority && (
				<span className='mr-2 flex-shrink-0 flex items-center justify-center opacity-90'>
					<PriorityIcon priority={item.meta.priority} />
				</span>
			)}

			<span className='truncate flex-1'>{item.name}</span>
		</NavLink>
	);
};
