import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';
import EntityIcon from '../../../../components/entity/EntityIcon';
import { resolveImageUrl } from '../../../../utils/image/imageResolver';

export const EntityListItem = ({ item, showStatus, onItemClick }) => {
	const isQuest = item.type === 'quest';
	const hasPriority = isQuest && item.meta.priority;

	// Resolve Icon (Custom image or default)
	const iconUrl = resolveImageUrl(item.attributes, 'icon');
	const hasCustomIcon = !!iconUrl;

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

			{/* Status Icon Container */}
			{showStatus && (
				<span
					className={clsx(
						'flex-shrink-0 flex items-center justify-center opacity-70',
						// If we have a priority icon next to it, reduce margin to keep them grouped
						hasPriority ? 'mr-1' : 'mr-2'
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
