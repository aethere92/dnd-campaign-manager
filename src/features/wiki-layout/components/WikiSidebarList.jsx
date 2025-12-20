import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { Shield, Sword, Circle, HelpCircle, ChevronRight, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { SidebarEmptyState } from './SidebarEmptyState';

const getStatusIcon = (status) => {
	const s = status?.toLowerCase() || 'unknown';
	if (['enemy', 'hostile', 'villain', 'rival'].some((k) => s.includes(k))) {
		return <Sword size={12} className='text-red-500 fill-red-500/10' />;
	}
	if (['ally', 'friendly', 'friend', 'helpful'].some((k) => s.includes(k))) {
		return <Shield size={12} className='text-emerald-500 fill-emerald-500/10' />;
	}
	if (['neutral', 'indifferent'].some((k) => s.includes(k))) {
		return <Circle size={10} className='text-gray-400' />;
	}
	return <HelpCircle size={12} className='text-gray-300' />;
};

const CollapsibleGroup = ({ group, onItemClick }) => {
	const [isOpen, setIsOpen] = useState(true);
	const showStatus = group.items.some((item) => ['npc', 'faction'].includes(item.type));

	return (
		<div className='select-none'>
			{/* Group Header - Collapsible */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 hover:bg-black/5 transition-colors'>
				{isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
				<span className='truncate'>{group.title}</span>
				<span className='ml-auto text-[10px] font-normal text-gray-400'>{group.items.length}</span>
			</button>

			{/* Items */}
			{isOpen && (
				<div className='space-y-0.5 pb-1'>
					{group.items.map((item) => {
						const displayStatus = item.affinity && item.affinity !== 'unknown' ? item.affinity : item.status;

						return (
							<NavLink
								key={item.id}
								to={item.path}
								onClick={onItemClick}
								className={({ isActive }) =>
									clsx(
										'group flex items-center w-full text-left pl-6 pr-2 py-1 text-[13px] transition-colors',
										isActive
											? 'bg-accent/10 text-accent font-medium'
											: 'text-gray-700 hover:bg-black/5 hover:text-foreground'
									)
								}>
								{showStatus && (
									<span className='mr-2 flex-shrink-0 flex items-center justify-center opacity-70'>
										{getStatusIcon(displayStatus)}
									</span>
								)}
								<span className='truncate flex-1'>{item.name}</span>
							</NavLink>
						);
					})}
				</div>
			)}
		</div>
	);
};

export const WikiSidebarList = ({ groups, isLoading, hasItems, config, onItemClick }) => {
	if (isLoading) {
		return (
			<div className='p-8 flex justify-center'>
				<LoadingSpinner size='sm' text='Loading...' />
			</div>
		);
	}

	if (!hasItems) {
		return <SidebarEmptyState label={config.label} />;
	}

	// Flatten check for empty search results
	const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
	if (totalItems === 0) {
		return <div className='p-6 text-center text-xs text-gray-400 italic'>No matches found.</div>;
	}

	// Check if we have grouped data (multiple groups with titles)
	const isGrouped = groups.length > 1 || (groups.length === 1 && groups[0].title !== null);

	return (
		<div className='lg:overflow-y-auto lg:h-full bg-muted py-1'>
			{isGrouped ? (
				// VS Code Style: Collapsible Groups
				<div className='space-y-1'>
					{groups.map((group) => (
						<CollapsibleGroup key={group.id} group={group} onItemClick={onItemClick} />
					))}
				</div>
			) : (
				// Flat List (No Grouping)
				<div className='px-2 space-y-0.5'>
					{groups[0].items.map((item) => {
						const showStatus = ['npc', 'faction'].includes(item.type);
						const displayStatus = item.affinity && item.affinity !== 'unknown' ? item.affinity : item.status;

						return (
							<NavLink
								key={item.id}
								to={item.path}
								onClick={onItemClick}
								className={({ isActive }) =>
									clsx(
										'group flex items-center w-full text-left px-2 py-1 text-[13px] rounded transition-colors',
										isActive
											? 'bg-accent/10 text-accent font-medium'
											: 'text-gray-700 hover:bg-black/5 hover:text-foreground'
									)
								}>
								{showStatus && (
									<span className='mr-2 flex-shrink-0 flex items-center justify-center opacity-70'>
										{getStatusIcon(displayStatus)}
									</span>
								)}
								<span className='truncate'>{item.name}</span>
							</NavLink>
						);
					})}
				</div>
			)}
		</div>
	);
};
