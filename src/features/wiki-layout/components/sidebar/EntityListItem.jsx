import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { StatusIcon } from './StatusIcon';
import { PriorityIcon } from './PriorityIcon';

export const EntityListItem = ({ item, showStatus, onItemClick }) => {
	const isQuest = item.type === 'quest';
	const hasPriority = isQuest && item.meta.priority;

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
			{/* Status Icon Container */}
			{showStatus && (
				<span className={clsx('flex-shrink-0 flex items-center justify-center opacity-70 mr-2')}>
					<StatusIcon entity={item} />
				</span>
			)}
			<span className='truncate flex-1'>{item.name}</span>

			{/* Priority Icon (Quests only) */}
			{hasPriority && (
				<span
					className='ml-auto flex-shrink-0 flex items-center justify-center opacity-90'
					title={`Priority: ${item.meta.priority}`}>
					<PriorityIcon priority={item.meta.priority} />
				</span>
			)}
		</NavLink>
	);
};
