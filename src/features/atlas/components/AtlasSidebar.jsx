import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
	Map as MapIcon,
	Search,
	Layers,
	BookOpen,
	ChevronRight,
	ChevronDown,
	Eye,
	EyeOff,
	Crosshair,
	Navigation,
	LocateFixed,
	PanelLeftClose,
	PanelLeftOpen,
	Menu,
	X,
} from 'lucide-react';
import { useAtlas } from '../context/AtlasContext';

// --- Compact Sidebar Components ---

const SidebarItem = ({ label, isVisible, onToggle, onNavigate, icon: Icon }) => (
	<div className='flex items-center gap-1 md:py-0.5 hover:bg-black/5 group rounded-md transition-colors min-w-0'>
		<button
			onClick={(e) => {
				e.stopPropagation();
				onToggle();
			}}
			className={clsx(
				'p-2 md:p-0.5 rounded transition-colors shrink-0 outline-none',
				isVisible ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/40 hover:text-muted-foreground'
			)}>
			{isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
		</button>

		<button
			onClick={onNavigate}
			className='flex-1 flex items-center text-left min-w-0 gap-2 py-1 md:py-0.5 outline-none'>
			{Icon && <Icon size={12} className='text-muted-foreground/70 shrink-0' />}
			<span
				className={clsx(
					'text-sm md:text-xs truncate transition-opacity',
					!isVisible && 'opacity-50 text-muted-foreground'
				)}>
				{label}
			</span>
		</button>

		<button
			onClick={(e) => {
				e.stopPropagation();
				onNavigate();
			}}
			className='hidden md:block p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground group-hover:opacity-100 opacity-0 transition-all'
			title='Fly To'>
			<Crosshair size={12} />
		</button>
	</div>
);

const SidebarGroup = ({ label, items, visibility, onToggleItem, onToggleGroup, onFlyTo }) => {
	const [isExpanded, setIsExpanded] = useState(true);

	const visibleCount = items.filter((i) => visibility[i.id]).length;
	const isAllVisible = visibleCount === items.length;
	const isNoneVisible = visibleCount === 0;
	const isMixed = !isAllVisible && !isNoneVisible;

	const handleGroupToggle = (e) => {
		e.stopPropagation();
		onToggleGroup(
			items.map((i) => i.id),
			isMixed ? true : !isAllVisible
		);
	};

	return (
		<div className='mb-0.5'>
			<div className='flex items-center gap-1 px-2 py-2 md:py-1 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 select-none group/header hover:bg-black/5 rounded-md'>
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className='p-1 text-muted-foreground hover:text-foreground transition-colors'>
					{isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
				</button>

				<span
					className='flex-1 text-xs md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer truncate'
					onClick={() => setIsExpanded(!isExpanded)}>
					{label} <span className='opacity-50 ml-1'>({items.length})</span>
				</span>

				<button
					onClick={handleGroupToggle}
					className={clsx(
						'p-1 rounded transition-colors',
						isAllVisible ? 'text-primary' : isMixed ? 'text-primary/70' : 'text-muted-foreground/30'
					)}>
					{isAllVisible ? <Eye size={12} /> : isMixed ? <Eye size={12} className='opacity-50' /> : <EyeOff size={12} />}
				</button>
			</div>

			{isExpanded && (
				<div className='pl-1 space-y-0.5 ml-2 border-l border-border/40'>
					{items.map((item) => (
						<SidebarItem
							key={item.id}
							label={item.label}
							isVisible={!!visibility[item.id]}
							onToggle={() => onToggleItem(item.id)}
							onNavigate={() => onFlyTo(item.position)}
						/>
					))}
				</div>
			)}
		</div>
	);
};

// --- Main Sidebar ---

export const AtlasSidebar = () => {
	const { mapData, isLoading, activeTab, setActiveTab, visibility, toggleItem, toggleGroup, flyTo } = useAtlas();
	const [searchTerm, setSearchTerm] = useState('');
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

	// Filtering Logic
	const filteredData = useMemo(() => {
		if (!mapData) return null;

		const filterFn = (item) => item.label && item.label.toLowerCase().includes(searchTerm.toLowerCase());

		return {
			groups: mapData.groups
				.map((g) => ({
					...g,
					items: g.items.filter(filterFn),
				}))
				.filter((g) => g.items.length > 0),

			sessions: mapData.sessions.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())),

			overlays: mapData.overlays.filter((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase())),

			// This is the key part that was likely missing or causing issues
			areas: (mapData.areas || []).filter((a) => a.label && a.label.toLowerCase().includes(searchTerm.toLowerCase())),
		};
	}, [mapData, searchTerm]);

	if (isLoading || !filteredData) return null;
	const title = mapData.config.label || mapData.config.title || 'Atlas';

	const Tab = ({ id, icon: Icon, label }) => (
		<button
			onClick={() => setActiveTab(id)}
			className={clsx(
				'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2',
				activeTab === id
					? 'border-primary text-primary bg-primary/5'
					: 'border-transparent text-muted-foreground hover:bg-black/5'
			)}>
			<Icon size={14} />
			<span className='hidden md:inline'>{label}</span>
		</button>
	);

	return (
		<>
			{/* Mobile Trigger */}
			<div className='absolute top-4 right-4 z-[400] md:hidden'>
				{!isMobileOpen && (
					<button
						onClick={() => setIsMobileOpen(true)}
						className='p-2 bg-background border border-border shadow-lg rounded-md'>
						<Menu size={20} />
					</button>
				)}
			</div>

			{/* Desktop Collapsed Strip */}
			{isDesktopCollapsed && (
				<div className='hidden md:flex flex-col h-full w-10 bg-muted border-l border-border z-20 items-center py-4 gap-4'>
					<button
						onClick={() => setIsDesktopCollapsed(false)}
						className='p-1.5 hover:bg-black/5 rounded text-muted-foreground'>
						<PanelLeftClose size={18} />
					</button>
				</div>
			)}

			{/* Sidebar Container */}
			<div
				className={clsx(
					'flex flex-col h-full bg-muted border-l border-border shadow-2xl z-[500] transition-transform duration-300',
					'absolute top-0 left-0 w-full md:w-72 md:static',
					isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
					isDesktopCollapsed && 'md:hidden'
				)}>
				{/* Header */}
				<div className='p-3 border-b border-border bg-muted flex flex-col gap-2 shrink-0'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2 text-foreground font-serif font-bold text-sm'>
							<MapIcon size={16} className='text-primary' />
							<span className='truncate'>{title}</span>
						</div>
						<div className='flex gap-1'>
							<button
								onClick={() => setIsDesktopCollapsed(true)}
								className='hidden md:block p-1 text-muted-foreground hover:text-primary'>
								<PanelLeftOpen size={16} />
							</button>
							<button onClick={() => setIsMobileOpen(false)} className='md:hidden p-2 text-muted-foreground'>
								<X size={20} />
							</button>
						</div>
					</div>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2 text-muted-foreground/50' size={12} />
						<input
							type='text'
							placeholder='Search...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full bg-background border border-border rounded text-xs pl-7 pr-2 py-1.5 focus:border-primary outline-none'
						/>
					</div>
				</div>

				{/* Tabs */}
				<div className='flex border-b border-border bg-muted/50 shrink-0'>
					<Tab id='locations' icon={LocateFixed} label='Places' />
					<Tab id='journal' icon={BookOpen} label='Journal' />
					<Tab id='layers' icon={Layers} label='Layers' />
				</div>

				{/* Content */}
				<div className='flex-1 overflow-y-auto custom-scrollbar p-1 bg-muted/30'>
					{/* PLACES TAB */}
					{activeTab === 'locations' && (
						<div className='space-y-0.5'>
							{filteredData.groups.map((group) => (
								<SidebarGroup
									key={group.id}
									label={group.label}
									items={group.items}
									visibility={visibility}
									onToggleItem={toggleItem}
									onToggleGroup={toggleGroup}
									onFlyTo={(pos) => {
										flyTo(pos);
										if (window.innerWidth < 768) setIsMobileOpen(false);
									}}
								/>
							))}
							{filteredData.groups.length === 0 && (
								<div className='p-4 text-center text-xs text-muted-foreground italic'>No locations found.</div>
							)}
						</div>
					)}

					{/* JOURNAL TAB */}
					{activeTab === 'journal' && (
						<div className='space-y-0.5'>
							{filteredData.sessions.map((session, idx) => (
								<SidebarItem
									key={`session-${idx}`}
									label={session.name}
									icon={Navigation}
									isVisible={visibility[`session-${session.name}`]}
									onToggle={() => toggleItem(`session-${session.name}`)}
									onNavigate={() => {
										flyTo(session.points?.[0]?.coordinates);
										if (window.innerWidth < 768) setIsMobileOpen(false);
									}}
								/>
							))}
						</div>
					)}

					{/* LAYERS TAB */}
					{activeTab === 'layers' && (
						<div className='space-y-4 p-2 pb-10'>
							{/* Base Layers */}
							<div className='bg-background/50 rounded-lg p-2 border border-border/50'>
								<div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 px-2'>
									<MapIcon size={12} /> Base Layers
								</div>
								<div className='space-y-0.5'>
									{filteredData.areas.length > 0 ? (
										<SidebarGroup
											label='Regions'
											items={filteredData.areas}
											visibility={visibility}
											onToggleItem={toggleItem}
											onToggleGroup={toggleGroup}
											onFlyTo={(pos) => {
												flyTo(pos);
												if (window.innerWidth < 768) setIsMobileOpen(false);
											}}
										/>
									) : (
										<div className='px-3 py-1 text-xs text-muted-foreground italic opacity-70'>No regions found.</div>
									)}
								</div>
							</div>

							{/* Overlays */}
							<div className='bg-background/50 rounded-lg p-2 border border-border/50'>
								<div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 px-2'>
									<Layers size={12} /> Overlays
								</div>
								{filteredData.overlays.map((o, idx) => (
									<SidebarItem
										key={`overlay-${idx}`}
										label={o.name}
										icon={Layers}
										isVisible={visibility[`overlay-${o.name}`]}
										onToggle={() => toggleItem(`overlay-${o.name}`)}
										onNavigate={() => {
											flyTo(o.bounds?.[0]);
											if (window.innerWidth < 768) setIsMobileOpen(false);
										}}
									/>
								))}
								{filteredData.overlays.length === 0 && (
									<div className='px-3 py-1 text-xs text-muted-foreground italic opacity-70'>
										No overlays available.
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Mobile Backdrop */}
			{isMobileOpen && (
				<div className='fixed inset-0 bg-black/50 z-[400] md:hidden' onClick={() => setIsMobileOpen(false)} />
			)}
		</>
	);
};
