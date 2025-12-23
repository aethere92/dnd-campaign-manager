import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
	ChevronRight,
	ChevronDown,
	Trees,
	Castle,
	Ship,
	Landmark,
	Map as MapIcon,
	Globe,
	Home,
	Mountain,
	MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '../../../../components/entity/EntityIcon';
import { StatusIcon } from './StatusIcon';
import { resolveImageUrl } from '../../../../utils/image/imageResolver';
import { getAttributeValue } from '../../../../utils/entity/attributeParser';

// Map for specific location types
const LOCATION_TYPE_ICONS = {
	building: Home,
	ship: Ship,
	landmark: Landmark,
	dungeon: Mountain, // Using Mountain to represent caves/dungeons
	region: MapIcon,
	city: Castle,
	forest: Trees,
	realm: Globe,
};

// Helper to pick the icon based on attribute
const getLocationIcon = (attributes) => {
	const type = getAttributeValue(attributes, 'type')?.toLowerCase();
	return LOCATION_TYPE_ICONS[type] || MapPin;
};

export const SidebarTreeItem = ({ item, onItemClick }) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = item.children && item.children.length > 0;

	const showStatus = ['npc', 'faction', 'quest'].includes(item.type);

	// 1. Resolve Custom Image (Works for Characters, NPCs, etc.)
	const iconUrl = resolveImageUrl(item.attributes, 'icon');
	const hasCustomIcon = !!iconUrl;

	// 2. Resolve Specific Location Icon (if no custom image)
	let LocationTypeIcon = null;
	if (!hasCustomIcon && item.type === 'location') {
		LocationTypeIcon = getLocationIcon(item.attributes);
	}

	return (
		<div className='select-none font-sans'>
			<div className='flex items-center w-full group py-0.5 hover:bg-black/5 rounded-sm transition-colors'>
				{/* EXPAND TOGGLE */}
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (hasChildren) setIsExpanded(!isExpanded);
					}}
					className={clsx(
						'w-5 h-6 flex items-center justify-center shrink-0 text-gray-400 hover:text-foreground transition-colors cursor-pointer',
						!hasChildren && 'invisible pointer-events-none'
					)}>
					{isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
				</button>

				{/* ENTITY LINK */}
				<NavLink
					to={item.path}
					onClick={onItemClick}
					className={({ isActive }) =>
						clsx(
							'flex-1 flex items-center gap-1.5 pr-2 text-[13px] truncate transition-colors rounded-r-sm',
							isActive ? 'text-accent font-semibold bg-accent/5' : 'text-gray-700'
						)
					}>
					{/* ICON CONTAINER */}
					<span
						className={clsx(
							'shrink-0 flex items-center justify-center',
							// Full opacity for custom images, dimmed for generic icons
							!hasCustomIcon && 'opacity-100',
							!hasCustomIcon && (item.type === 'location' ? 'text-stone-400' : 'text-stone-600')
						)}>
						{hasCustomIcon ? (
							// CASE A: Custom Image (Character Portrait, etc.)
							<EntityIcon type={item.type} customIconUrl={iconUrl} size={14} />
						) : LocationTypeIcon ? (
							// CASE B: Specific Location Icon (Castle, Trees, etc.)
							<LocationTypeIcon size={14} strokeWidth={2} />
						) : (
							// CASE C: Generic Default Icon (Fallback)
							<EntityIcon type={item.type} size={12} />
						)}
					</span>

					<span className='truncate'>{item.name}</span>

					{/* Status Icon (Right aligned) */}
					{showStatus && (
						<span className='ml-auto opacity-70 flex items-center'>
							<StatusIcon entity={item} />
						</span>
					)}
				</NavLink>
			</div>

			{/* RECURSIVE CHILDREN */}
			{isExpanded && hasChildren && (
				<div className='ml-[9px] border-l border-border/60 pl-1'>
					{item.children.map((child) => (
						<SidebarTreeItem key={child.id} item={child} onItemClick={onItemClick} />
					))}
				</div>
			)}
		</div>
	);
};
