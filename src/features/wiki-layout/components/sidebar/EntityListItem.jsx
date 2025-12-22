import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { StatusIcon } from './StatusIcon';

export const EntityListItem = ({ item, showStatus, onItemClick }) => {
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
			{showStatus && (
				<span className='mr-2 flex-shrink-0 flex items-center justify-center opacity-70'>
					<StatusIcon entity={item} />
				</span>
			)}
			<span className='truncate flex-1'>{item.name}</span>
		</NavLink>
	);
};
