import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
	Search,
	PanelLeftClose,
	PanelLeftOpen,
	Map as MapIcon,
	ChevronRight,
	ChevronDown,
	Eye,
	EyeOff,
	Crosshair,
} from 'lucide-react';

/**
 * Sidebar Group Item
 */
const AtlasGroup = ({ group, visibility, onToggleVisibility, onNavigate }) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const isGroupVisible = visibility[group.id];

	return (
		<div className='select-none'>
			{/* Header */}
			<div className='flex items-center gap-1 px-3 py-2 hover:bg-black/5 transition-colors group/header sticky top-0 bg-muted/95 backdrop-blur-sm z-10 border-b border-border/40'>
				{/* Expand Toggle */}
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className='p-0.5 text-muted-foreground/70 hover:text-foreground'>
					{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
				</button>

				{/* Title */}
				<span
					className={clsx(
						'flex-1 text-xs font-bold uppercase tracking-wider cursor-pointer truncate',
						isGroupVisible
							? 'text-foreground'
							: 'text-muted-foreground decoration-line-through decoration-muted-foreground/50'
					)}
					onClick={() => setIsExpanded(!isExpanded)}>
					{group.label}
				</span>

				{/* Layer Visibility Toggle (Global for Group) */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						onToggleVisibility(group.id);
					}}
					className={clsx(
						'p-1.5 rounded-md transition-all',
						isGroupVisible ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/50 hover:text-foreground'
					)}
					title={isGroupVisible ? 'Hide Layer' : 'Show Layer'}>
					{isGroupVisible ? <Eye size={14} /> : <EyeOff size={14} />}
				</button>
			</div>

			{/* Marker List */}
			{isExpanded && (
				<div className='pl-2 pb-1 pt-0.5 space-y-0.5'>
					{group.items.map((marker, idx) => {
						const isItemVisible = visibility[marker.id];

						return (
							<div
								key={`${group.id}-${idx}`}
								className='flex items-center gap-1 pr-2 group/item hover:bg-black/5 rounded-md'>
								{/* Navigation Button */}
								<button
									onClick={() => onNavigate(marker.position)}
									className='flex-1 flex items-center text-left gap-2 px-2 py-1.5 min-w-0'>
									<span className='opacity-50 group-hover/item:opacity-100 transition-opacity shrink-0'>
										<Crosshair size={12} />
									</span>
									<span
										className={clsx(
											'text-sm font-medium truncate transition-colors',
											isItemVisible && isGroupVisible ? 'text-foreground' : 'text-muted-foreground opacity-70'
										)}>
										{marker.label}
									</span>
								</button>

								{/* Individual Visibility Toggle */}
								<button
									onClick={() => onToggleVisibility(marker.id)}
									className={clsx(
										'p-1 rounded opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity',
										isItemVisible ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/50'
									)}
									title={isItemVisible ? 'Hide Item' : 'Show Item'}>
									{isItemVisible ? <Eye size={12} /> : <EyeOff size={12} />}
								</button>
							</div>
						);
					})}
					{group.items.length === 0 && (
						<div className='text-[10px] text-muted-foreground/50 pl-9 italic py-1'>No locations</div>
					)}
				</div>
			)}
		</div>
	);
};

export const AtlasSidebar = ({ groups, visibility, onToggleLayer, onFlyTo }) => {
	const [search, setSearch] = useState('');
	const [desktopCollapsed, setDesktopCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	// Filter logic
	const filteredGroups = groups
		.map((g) => ({
			...g,
			items: g.items.filter((m) => m.label.toLowerCase().includes(search.toLowerCase())),
		}))
		.filter((g) => g.items.length > 0 || search === '');

	return (
		<>
			{/* COLLAPSED STATE (Desktop) */}
			{desktopCollapsed && (
				<div className='hidden lg:flex flex-col h-full border-l border-border bg-muted w-12 shrink-0 z-10 transition-all duration-300'>
					<div className='p-3 border-b border-border/50 h-14 flex items-center justify-center'>
						<button
							onClick={() => setDesktopCollapsed(false)}
							className='p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors'
							title='Expand Atlas Sidebar'>
							<PanelLeftClose size={20} />
						</button>
					</div>
				</div>
			)}

			{/* SIDEBAR */}
			<div
				className={clsx(
					'flex flex-col bg-muted border-l border-border transition-all duration-300',
					// FIX: Removed global 'h-full' here.

					// Desktop Width Logic
					desktopCollapsed ? 'w-0 overflow-hidden border-none' : 'w-full lg:w-80',

					// Position Logic
					'absolute top-0 left-0 lg:relative z-[1000] lg:z-0',

					// Height Logic:
					// Mobile Closed: h-auto (just header)
					// Mobile Open: h-full (full screen overlay)
					// Desktop: h-full
					!mobileOpen ? 'h-auto bottom-auto lg:h-full' : 'h-full'
				)}>
				{/* Header */}
				<div className='p-4 border-b border-border/50 bg-muted flex flex-col gap-3'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2 text-foreground font-serif font-bold'>
							<MapIcon size={18} className='text-primary' />
							<span>Atlas Index</span>
						</div>

						<div className='flex gap-1'>
							{/* Desktop Collapse */}
							<button
								onClick={() => setDesktopCollapsed(true)}
								className='hidden lg:block p-1 text-muted-foreground hover:text-primary transition-colors'
								title='Collapse Sidebar'>
								<PanelLeftOpen size={16} />
							</button>

							{/* Mobile Toggle */}
							<button
								onClick={() => setMobileOpen(!mobileOpen)}
								className='lg:hidden p-1 text-muted-foreground hover:text-foreground transition-colors'
								aria-label={mobileOpen ? 'Collapse' : 'Expand'}>
								{mobileOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
							</button>
						</div>
					</div>

					{/* Search - Visible when open */}
					<div className={clsx('relative', !mobileOpen && 'hidden lg:block')}>
						<Search className='absolute left-2.5 top-2.5 text-muted-foreground/50' size={14} />
						<input
							type='text'
							placeholder='Search locations...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className='w-full bg-background border border-border rounded-md pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary outline-none shadow-sm'
						/>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className={clsx('flex-1 overflow-y-auto custom-scrollbar bg-muted/30', !mobileOpen && 'hidden lg:block')}>
					{filteredGroups.map((group) => (
						<AtlasGroup
							key={group.id}
							group={group}
							visibility={visibility}
							onToggleVisibility={onToggleLayer}
							onNavigate={onFlyTo}
						/>
					))}

					{filteredGroups.length === 0 && (
						<div className='p-6 text-center text-xs text-muted-foreground italic'>No locations found.</div>
					)}
				</div>
			</div>
		</>
	);
};
