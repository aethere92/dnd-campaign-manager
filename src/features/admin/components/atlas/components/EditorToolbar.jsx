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
	const { state, actions, saveMap } = useAtlasEditor();
	const { activeTool, isSaving, mode } = state;

	const handleNewPath = () => {
		const newPath = {
			_id: crypto.randomUUID(),
			name: 'New Path',
			lineColor: '#d97706',
			opacity: 1,
			points: [],
		};
		actions.addPath(newPath);
	};

	const handleNewArea = () => {
		const newArea = {
			_id: crypto.randomUUID(),
			name: 'New Region',
			interiorColor: '#ff0000',
			lineColor: 'transparent',
			points: [],
		};
		actions.addArea(newArea);
	};

	const handleNewOverlay = () => {
		const newOverlay = {
			_id: crypto.randomUUID(),
			name: 'New Overlay',
			image: '',
			bounds: [
				[0, 0],
				[-100, 100],
			],
		};
		actions.addOverlay(newOverlay);
	};

	return (
		<div className='absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-auto'>
			<div className='bg-background/95 backdrop-blur border border-border p-2 rounded-lg shadow-xl'>
				<Button size='sm' variant='primary' icon={isSaving ? Loader2 : Save} onClick={saveMap} disabled={isSaving}>
					{isSaving ? 'Saving' : 'Save'}
				</Button>
			</div>

			<div className='bg-background/95 backdrop-blur border border-border p-1 rounded-lg shadow-xl flex flex-col gap-1'>
				<ToolBtn
					icon={MapPin}
					label='Markers'
					active={activeTool === 'markers'}
					onClick={() => actions.setTool('markers')}
				/>
				<ToolBtn
					icon={Footprints}
					label='Paths'
					active={activeTool === 'paths'}
					onClick={() => actions.setTool('paths')}
				/>
				<ToolBtn
					icon={Hexagon}
					label='Regions'
					active={activeTool === 'areas'}
					onClick={() => actions.setTool('areas')}
				/>
				<ToolBtn
					icon={ImageIcon}
					label='Overlays'
					active={activeTool === 'overlays'}
					onClick={() => actions.setTool('overlays')}
				/>
			</div>

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

			{mode === 'draw' && (
				<div
					className='bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl animate-pulse text-center cursor-pointer'
					onClick={() => actions.setMode('select')}>
					DRAWING ACTIVE
					<br />
					<span className='underline opacity-80'>Stop</span>
				</div>
			)}
		</div>
	);
}
