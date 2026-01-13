import React from 'react';
import { useAtlasEditor } from '../AtlasEditorContext';
// UPDATE these lines at the top of EditorSidebar.jsx
import MarkerForm from '@/features/admin/components/atlas/forms/MarkerForm';
import PathForm from '@/features/admin/components/atlas/forms/PathForm';
import AreaForm from '@/features/admin/components/atlas/forms/AreaForm';
import { OverlayForm } from '@/features/admin/components/atlas/forms/OverlayForm'; // New Import
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import { Trash2, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

// Wrapper
const SidebarWrapper = ({ children, title, onClose, actions }) => (
	<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
		<div className='flex justify-between items-center p-4 border-b border-border bg-muted/40 shrink-0'>
			<span className='font-bold text-sm uppercase flex items-center gap-2'>{title}</span>
			<div className='flex gap-1 items-center'>
				{actions}
				<button
					onClick={onClose}
					className='p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors'
					title='Close'>
					<X size={16} />
				</button>
			</div>
		</div>
		<div className='p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar'>{children}</div>
	</div>
);

export default function EditorSidebar() {
	const { state, actions } = useAtlasEditor();
	const { selection, markers, paths, areas, overlays } = state;

	if (!selection) return null;

	const handleClose = () => actions.deselect();

	const handleDelete = () => {
		if (!confirm('Delete this item?')) return;

		switch (selection.type) {
			case 'marker':
				actions.deleteMarker(selection.id);
				break;
			case 'path':
				actions.deletePath(selection.id);
				break;
			case 'area':
				actions.deleteArea(selection.id);
				break;
			case 'overlay':
				actions.deleteOverlay(selection.id);
				break;
		}
	};

	// --- PATH POINT EDITOR ---
	if (selection.type === 'path' && selection.index !== undefined) {
		const pathData = paths.find((p) => p._id === selection.id);
		if (!pathData) return null;

		const point = pathData.points[selection.index];
		const totalPoints = pathData.points.length;

		return (
			<SidebarWrapper
				title={`Path Node #${selection.index + 1}`}
				onClose={() => actions.selectItem('path', selection.id)} // Back to parent
				actions={
					<div className='flex mr-2 bg-muted rounded border border-border'>
						<button
							disabled={selection.index === 0}
							onClick={() => actions.selectItem('path', selection.id, selection.index - 1)}
							className='p-1 hover:text-primary disabled:opacity-30'>
							<ChevronLeft size={14} />
						</button>
						<button
							disabled={selection.index === totalPoints - 1}
							onClick={() => actions.selectItem('path', selection.id, selection.index + 1)}
							className='p-1 hover:text-primary disabled:opacity-30 border-l border-border'>
							<ChevronRight size={14} />
						</button>
					</div>
				}>
				<div className='space-y-4'>
					<div className='bg-primary/10 border border-primary/20 p-3 rounded-md text-xs text-primary flex gap-2'>
						<MessageSquare size={16} className='shrink-0' />
						<span>Add narrative text here. This will appear as a clickable dot on the map.</span>
					</div>

					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Narrative Text</label>
						<textarea
							className={ADMIN_INPUT_CLASS}
							rows={6}
							value={point.text || ''}
							placeholder='e.g. "The party was ambushed by goblins here..."'
							onChange={(e) => actions.updatePathPoint(selection.id, selection.index, { text: e.target.value })}
						/>
					</div>

					<div className='pt-4 border-t border-border'>
						<Button
							variant='secondary'
							size='sm'
							fullWidth
							onClick={() => {
								if (confirm('Delete this point?')) {
									actions.deletePathPoint(selection.id, selection.index);
									handleClose();
								}
							}}
							className='text-red-500 hover:bg-red-500/10'>
							Delete Point
						</Button>
					</div>
				</div>
			</SidebarWrapper>
		);
	}

	// --- STANDARD ENTITY FORMS ---
	let data = null;
	let FormComponent = null;
	let updateFn = null;

	if (selection.type === 'marker') {
		data = markers.find((m) => m._id === selection.id);
		FormComponent = MarkerForm;
		updateFn = (f, v) => actions.updateMarker(selection.id, { [f]: v });
	} else if (selection.type === 'path') {
		data = paths.find((p) => p._id === selection.id);
		FormComponent = PathForm;
		updateFn = (f, v) => actions.updatePath(selection.id, { [f]: v });
	} else if (selection.type === 'area') {
		data = areas.find((a) => a._id === selection.id);
		FormComponent = AreaForm;
		updateFn = (f, v) => actions.updateArea(selection.id, { [f]: v });
	} else if (selection.type === 'overlay') {
		data = overlays.find((o) => o._id === selection.id);
		// OverlayForm uses `actions` directly, not the generic updateFn pattern
		return (
			<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] animate-in slide-in-from-right-4'>
				<OverlayForm data={data} actions={actions} onClose={handleClose} />
			</div>
		);
	}

	if (!data || !FormComponent) return null;

	return (
		<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] animate-in slide-in-from-right-4'>
			<FormComponent data={data} onChange={updateFn} onDelete={handleDelete} onClose={handleClose} />
		</div>
	);
}
