// --- FILE: components/EditorLayerList.jsx ---
import React, { useState, useMemo } from 'react';
import { useAtlasEditor } from '../AtlasEditorContext';
import {
	ChevronDown,
	ChevronRight,
	MapPin,
	Footprints,
	Hexagon,
	Image as ImageIcon,
	Search,
	Eye,
	EyeOff,
	CloudFog,
} from 'lucide-react';
import clsx from 'clsx';

// Memoize Group to prevent re-rendering list items when typing in other forms
const Group = React.memo(({ title, icon: Icon, items, type, onSelect, selection, isVisible, onToggle }) => {
	const [isOpen, setIsOpen] = useState(true);
	if (!items || items.length === 0) return null;

	return (
		<div className='mb-2'>
			<div className='flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted/20 hover:bg-muted/50 transition-colors group'>
				<button onClick={() => setIsOpen(!isOpen)} className='flex items-center flex-1 text-left'>
					<span className='mr-2 opacity-70'>{isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
					<Icon size={14} className='mr-2' />
					{title}
					<span className='ml-auto text-[10px] bg-muted px-1.5 rounded'>{items.length}</span>
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onToggle();
					}}
					className={clsx(
						'p-1 ml-2 rounded hover:bg-background transition-colors',
						isVisible ? 'text-primary' : 'text-muted-foreground opacity-50'
					)}
					title={isVisible ? 'Hide Layer' : 'Show Layer'}>
					{isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
				</button>
			</div>
			{isOpen && isVisible && (
				<div className='space-y-0.5 mt-1'>
					{items.map((item) => {
						const isSelected = selection?.type === type && selection.id === item._id;
						return (
							<button
								key={item._id}
								onClick={() => onSelect(type, item._id)}
								className={clsx(
									'flex items-center w-full text-left px-8 py-1.5 text-xs transition-colors border-l-2',
									isSelected
										? 'bg-primary/10 border-primary text-primary font-medium'
										: 'border-transparent text-foreground/80 hover:bg-muted/50 hover:text-foreground'
								)}>
								<span className='truncate'>{item.label || item.name || 'Untitled'}</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
});

export default function EditorLayerList() {
	const { state, actions } = useAtlasEditor();
	const { markers, paths, areas, overlays, selection, visibility, fog } = state;
	const [search, setSearch] = useState('');

	// Optimize filtering with useMemo
	const filteredData = useMemo(() => {
		const term = search.toLowerCase();
		const filterFn = (i) => (i.label || i.name || '').toLowerCase().includes(term);

		return {
			markers: markers.filter(filterFn),
			paths: paths.filter(filterFn),
			areas: areas.filter(filterFn),
			overlays: overlays.filter(filterFn),
		};
	}, [search, markers, paths, areas, overlays]);

	return (
		<div className='flex flex-col h-full bg-background/95 backdrop-blur border-r border-border w-64 z-10'>
			<div className='p-3 border-b border-border'>
				<div className='relative'>
					<Search className='absolute left-2.5 top-2 text-muted-foreground' size={12} />
					<input
						type='text'
						placeholder='Filter layers...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='w-full bg-muted/50 border border-border rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary'
					/>
				</div>
			</div>
			<div className='flex-1 overflow-y-auto custom-scrollbar py-2'>
				{/* NEW: Fog Group */}
				{/* We treat Fog as a single item group for consistency */}
				{fog && (
					<Group
						title='Fog of War'
						icon={CloudFog}
						items={fog.enabled ? [{ _id: 'fog-config', label: 'Fog Layer', type: 'fog-layer' }] : []}
						type='fog' // This doesn't matter much since we select via tool
						onSelect={() => actions.setTool('fog')} // Clicking the item activates the tool
						selection={selection} // Pass selection to highlight if active
						isVisible={visibility.fog !== false} // Default true
						onToggle={() => actions.toggleVisibility('fog')} // New action needed below
					/>
				)}
				<Group
					title='Markers'
					icon={MapPin}
					items={filteredData.markers}
					type='marker'
					onSelect={actions.selectItem}
					selection={selection}
					isVisible={visibility.markers}
					onToggle={() => actions.toggleVisibility('markers')}
				/>
				<Group
					title='Paths'
					icon={Footprints}
					items={filteredData.paths}
					type='path'
					onSelect={actions.selectItem}
					selection={selection}
					isVisible={visibility.paths}
					onToggle={() => actions.toggleVisibility('paths')}
				/>
				<Group
					title='Regions'
					icon={Hexagon}
					items={filteredData.areas}
					type='area'
					onSelect={actions.selectItem}
					selection={selection}
					isVisible={visibility.areas}
					onToggle={() => actions.toggleVisibility('areas')}
				/>
				<Group
					title='Overlays'
					icon={ImageIcon}
					items={filteredData.overlays}
					type='overlay'
					onSelect={actions.selectItem}
					selection={selection}
					isVisible={visibility.overlays}
					onToggle={() => actions.toggleVisibility('overlays')}
				/>
			</div>
		</div>
	);
}
