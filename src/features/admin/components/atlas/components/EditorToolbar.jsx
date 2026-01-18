// --- FILE: components/EditorToolbar.jsx ---
import React from 'react';
import {
	MousePointer2,
	MapPin,
	Type,
	Hexagon,
	Waypoints,
	Save,
	Loader2,
	Image as ImageIcon,
	Settings,
} from 'lucide-react';
import { useAtlasEditor } from '../AtlasEditorContext';
import clsx from 'clsx';

// Icon Button Component
const ToolBtn = ({ icon: Icon, active, onClick, title, disabled, className }) => (
	<button
		onClick={onClick}
		title={title}
		disabled={disabled}
		className={clsx(
			'p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[40px]',
			active
				? 'bg-primary text-primary-foreground shadow-sm'
				: 'text-muted-foreground hover:bg-muted hover:text-foreground',
			disabled && 'opacity-50 cursor-not-allowed',
			className,
		)}>
		<Icon size={20} strokeWidth={active ? 2.5 : 2} />
	</button>
);

export default function EditorToolbar() {
	const { state, actions, saveMap } = useAtlasEditor();
	const { activeTool, isSaving, selection } = state;

	const isSettingsActive = selection?.type === 'settings';

	return (
		<div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none'>
			{/* Floating Toolbar */}
			<div className='pointer-events-auto flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/50 p-2 rounded-2xl shadow-2xl ring-1 ring-black/5'>
				{/* 1. SELECT Tool */}
				<ToolBtn
					icon={MousePointer2}
					title='Select (V)'
					active={activeTool === 'select'}
					onClick={() => actions.setTool('select')}
				/>

				{/* 2. MARKER Tool */}
				<ToolBtn
					icon={MapPin}
					title='Marker (M)'
					active={activeTool === 'markers'}
					onClick={() => actions.setTool('markers')}
				/>

				{/* 3. LABEL Tool */}
				<ToolBtn icon={Type} title='Label (T)' active={activeTool === 'text'} onClick={() => actions.setTool('text')} />

				{/* 4. REGION Tool */}
				<ToolBtn
					icon={Hexagon}
					title='Region (R)'
					active={activeTool === 'areas'}
					onClick={() => actions.setTool('areas')}
				/>

				{/* 5. PATH Tool */}
				<ToolBtn
					icon={Waypoints}
					title='Path (P)'
					active={activeTool === 'paths'}
					onClick={() => actions.setTool('paths')}
				/>

				{/* 6. OVERLAYS Tool */}
				<ToolBtn
					icon={ImageIcon}
					title='Overlays (O)'
					active={activeTool === 'overlays'}
					onClick={() => actions.setTool('overlays')}
				/>

				<ToolBtn
					icon={Settings}
					title='Map Properties'
					active={isSettingsActive}
					onClick={() => actions.selectItem('settings', 'global')}
				/>

				{/* 7. SAVE Button */}
				<ToolBtn
					icon={isSaving ? Loader2 : Save}
					title='Save Map'
					active={false} // Action button, not a mode
					onClick={saveMap}
					disabled={isSaving}
					className={clsx(isSaving && 'animate-spin')}
				/>
			</div>
		</div>
	);
}
