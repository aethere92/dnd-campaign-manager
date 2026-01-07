import React from 'react';
import { Save, Loader2, MapPin, Footprints, Hexagon, Image as ImageIcon, Plus } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { useAtlasEditor } from '../AtlasEditorContext';
import clsx from 'clsx';

const ToolBtn = ({ icon: Icon, label, active, onClick }) => (
	<button
		onClick={onClick}
		className={clsx(
			'flex items-center gap-2 p-2 rounded-md transition-all text-xs font-bold uppercase',
			active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'
		)}
		title={label}>
		<Icon size={18} />
		<span className='hidden md:inline'>{label}</span>
	</button>
);

export default function EditorToolbar() {
	const { state, dispatch, saveMap } = useAtlasEditor();
	const { activeTool, isSaving, mode } = state;

	// Handlers for "New Item" buttons
	const handleNewPath = () => {
		const newPath = {
			_id: crypto.randomUUID(),
			name: 'New Path',
			lineColor: '#d97706',
			opacity: 1,
			points: [],
		};
		dispatch({ type: 'ADD_PATH', payload: newPath });
	};

	const handleNewArea = () => {
		const newArea = {
			_id: crypto.randomUUID(),
			name: 'New Region',
			interiorColor: '#ff0000',
			lineColor: 'transparent',
			points: [],
		};
		dispatch({ type: 'ADD_AREA', payload: newArea });
	};

	const handleNewOverlay = () => {
		const newOverlay = {
			_id: crypto.randomUUID(),
			name: 'New Overlay',
			image: '',
			bounds: [
				[0, 0],
				[-100, 100],
			], // Default box
		};
		dispatch({ type: 'ADD_OVERLAY', payload: newOverlay });
	};

	return (
		<div className='absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-auto'>
			{/* SAVE */}
			<div className='bg-background/95 backdrop-blur border border-border p-2 rounded-lg shadow-xl'>
				<Button size='sm' variant='primary' icon={isSaving ? Loader2 : Save} onClick={saveMap} disabled={isSaving}>
					{isSaving ? 'Saving' : 'Save'}
				</Button>
			</div>

			{/* TOOLS */}
			<div className='bg-background/95 backdrop-blur border border-border p-1 rounded-lg shadow-xl flex flex-col gap-1'>
				<ToolBtn
					icon={MapPin}
					label='Markers'
					active={activeTool === 'markers'}
					onClick={() => dispatch({ type: 'SET_TOOL', payload: 'markers' })}
				/>
				<ToolBtn
					icon={Footprints}
					label='Paths'
					active={activeTool === 'paths'}
					onClick={() => dispatch({ type: 'SET_TOOL', payload: 'paths' })}
				/>
				<ToolBtn
					icon={Hexagon}
					label='Regions'
					active={activeTool === 'areas'}
					onClick={() => dispatch({ type: 'SET_TOOL', payload: 'areas' })}
				/>
				<ToolBtn
					icon={ImageIcon}
					label='Overlays'
					active={activeTool === 'overlays'}
					onClick={() => dispatch({ type: 'SET_TOOL', payload: 'overlays' })}
				/>
			</div>

			{/* ACTIONS */}
			{activeTool === 'paths' && (
				<Button size='sm' variant='secondary' icon={Plus} onClick={handleNewPath} className='shadow-xl'>
					New Path
				</Button>
			)}
			{activeTool === 'areas' && (
				<Button size='sm' variant='secondary' icon={Plus} onClick={handleNewArea} className='shadow-xl'>
					New Region
				</Button>
			)}
			{activeTool === 'overlays' && (
				<Button size='sm' variant='secondary' icon={Plus} onClick={handleNewOverlay} className='shadow-xl'>
					New Overlay
				</Button>
			)}

			{/* DRAWING MODE INDICATOR */}
			{mode === 'draw' && (
				<div
					className='bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl animate-pulse text-center cursor-pointer'
					onClick={() => dispatch({ type: 'SET_MODE', payload: 'select' })}>
					DRAWING ACTIVE
					<br />
					<span className='underline opacity-80'>Stop</span>
				</div>
			)}
		</div>
	);
}
