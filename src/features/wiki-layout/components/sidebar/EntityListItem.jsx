import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';
import EntityIcon from '../../../../components/entity/EntityIcon';
import { resolveImageUrl } from '../../../../utils/image/imageResolver';

// Configuration: Which types should show their GENERIC (Lucide) icon in the list?
// If false, we rely on the Status Icon or simply text/custom image.
const SHOW_GENERIC_ICON = {
	character: true,
	session: true,
	location: true,
	encounter: true,
	// Quests & Factions use Status/Affinity icons as their primary visual indicator in lists
	quest: false,
	faction: false,
	// NPCs in flat lists: Hide Crown if no portrait, as Status (Shield/Sword) is more informative
	npc: false,
	default: true,
};

export const EntityListItem = ({ item, showStatus, onItemClick }) => {
	const isQuest = item.type === 'quest';
	const hasPriority = isQuest && item.meta.priority;

	// 1. Resolve Custom Icon (Portrait/Logo)
	const iconUrl = resolveImageUrl(item.attributes, 'icon');
	const hasCustomIcon = !!iconUrl;

	// 2. Determine if we show the main icon slot
	// Always show if it's a custom image (content).
	// If generic, check the config (avoid double-icons for types with status).
	const shouldShowIcon = hasCustomIcon || (SHOW_GENERIC_ICON[item.type] ?? SHOW_GENERIC_ICON.default);

	return (
		<NavLink
			to={item.path}
			onClick={onItemClick}
			className={({ isActive }) =>
				clsx(
					'group flex items-center w-full text-left pl-6 pr-2 py-1 text-[13px] transition-colors',
					isActive ? 'bg-accent/10 text-accent font-medium' : 'text-gray-700 hover:bg-black/5 hover:text-foreground'
				)
			}>
			{/* ENTITY ICON / PORTRAIT */}
			{shouldShowIcon && (
				<span
					className={clsx(
						'shrink-0 flex items-center justify-center mr-2',
						// Dim generic icons, keep custom images vibrant
						!hasCustomIcon && 'opacity-70 text-stone-500'
					)}>
					<EntityIcon
						type={item.type}
						customIconUrl={iconUrl}
						size={hasCustomIcon ? 14 : 12}
						className={hasCustomIcon ? 'rounded-sm object-cover shadow-sm border border-black/5' : ''}
					/>
				</span>
			)}

			{/* Status Icon Container */}
			{showStatus && (
				<span
					className={clsx(
						'flex-shrink-0 flex items-center justify-center opacity-70',
						// Adjust margin based on whether there's an icon to the left or right
						hasPriority ? 'mr-1' : 'mr-2',
						// If no EntityIcon shown, this becomes the left-most element (bullet)
						!shouldShowIcon && 'ml-[-2px]'
					)}>
					<StatusIcon entity={item} />
				</span>
			)}

			{/* Priority Icon (Quests only) */}
			{hasPriority && (
				<span
					className='mr-2 flex-shrink-0 flex items-center justify-center opacity-90'
					title={`Priority: ${item.meta.priority}`}>
					<PriorityIcon priority={item.meta.priority} />
				</span>
			)}

			<span className='truncate flex-1'>{item.name}</span>
		</NavLink>
	);
};
