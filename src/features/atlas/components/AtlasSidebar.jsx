import React, { useState } from 'react';
import { clsx } from 'clsx';
import {
	Map as MapIcon,
	Search,
	Layers,
	BookOpen,
	Navigation,
	LocateFixed,
	PanelLeftClose,
	PanelLeftOpen,
	Menu,
	X,
} from 'lucide-react';
import { useAtlas } from '../context/AtlasContext';
import { useAtlasSearch } from '../utils/useAtlasSearch';
import { SidebarItem } from './sidebar/SidebarItem';
import { SidebarGroup } from './sidebar/SidebarGroup';

export const AtlasSidebar = () => {
	const { mapData, isLoading, activeTab, setActiveTab, visibility, toggleItem, toggleGroup, flyTo } = useAtlas();
	const { searchTerm, setSearchTerm, filteredData } = useAtlasSearch(mapData);

	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

	if (isLoading || !filteredData) return null;
	const title = mapData.config.label || mapData.config.title || 'Atlas';

	const handleFlyTo = (pos) => {
		flyTo(pos);
		if (window.innerWidth < 768) setIsMobileOpen(false);
	};

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
						className='p-2 bg-background border border-border shadow-lg rounded-md text-foreground'>
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
									onFlyTo={handleFlyTo}
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
									onNavigate={() => handleFlyTo(session.points?.[0]?.coordinates)}
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
											onFlyTo={handleFlyTo}
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
										onNavigate={() => handleFlyTo(o.bounds?.[0])}
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
