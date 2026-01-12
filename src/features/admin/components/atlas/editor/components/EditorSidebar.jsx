import React from 'react';
import { useAtlasEditor } from '../AtlasEditorContext';
import { MarkerForm, PathForm, AreaForm } from '../../AtlasForms';
import SmartImageInput from '@/features/admin/components/SmartImageInput';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import { Trash2, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

// Wrapper
const SidebarWrapper = ({ children, title, onDelete, onClose, actions }) => (
	<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
		<div className='flex justify-between items-center p-4 border-b border-border bg-muted/40 shrink-0'>
			<span className='font-bold text-sm uppercase flex items-center gap-2'>{title}</span>
			<div className='flex gap-1 items-center'>
				{actions}
				{onDelete && (
					<button
						onClick={onDelete}
						className='p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors'
						title='Delete Item'>
						<Trash2 size={16} />
					</button>
				)}
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
	const { state, dispatch } = useAtlasEditor();
	const { selection, markers, paths, areas, overlays } = state;

	if (!selection) return null;

	const handleClose = () => dispatch({ type: 'SELECT_ITEM', payload: null });
	const handleDelete = () => {
		const typeMap = { marker: 'DELETE_MARKER', path: 'DELETE_PATH', area: 'DELETE_AREA', overlay: 'DELETE_OVERLAY' };
		if (confirm('Delete this item?')) {
			dispatch({ type: typeMap[selection.type], id: selection.id });
		}
	};

	// --- PATH POINT EDITOR (The Missing Feature) ---
	if (selection.type === 'path' && selection.index !== undefined) {
		const pathData = paths.find((p) => p._id === selection.id);
		if (!pathData) return null;

		const point = pathData.points[selection.index];
		const totalPoints = pathData.points.length;

		// Navigation handlers
		const selectPoint = (idx) => dispatch({ type: 'SELECT_ITEM', payload: { ...selection, index: idx } });

		return (
			<SidebarWrapper
				title={`Path Node #${selection.index + 1}`}
				onClose={() => dispatch({ type: 'SELECT_ITEM', payload: { type: 'path', id: selection.id } })} // Go back to Path root
				actions={
					<div className='flex mr-2 bg-muted rounded border border-border'>
						<button
							disabled={selection.index === 0}
							onClick={() => selectPoint(selection.index - 1)}
							className='p-1 hover:text-primary disabled:opacity-30'>
							<ChevronLeft size={14} />
						</button>
						<button
							disabled={selection.index === totalPoints - 1}
							onClick={() => selectPoint(selection.index + 1)}
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
							onChange={(e) =>
								dispatch({
									type: 'UPDATE_PATH_POINT',
									id: selection.id,
									index: selection.index,
									updates: { text: e.target.value },
								})
							}
						/>
					</div>

					<div className='pt-4 border-t border-border'>
						<Button
							variant='secondary'
							size='sm'
							fullWidth
							onClick={() => {
								if (confirm('Delete this point?')) {
									dispatch({ type: 'DELETE_PATH_POINT', id: selection.id, index: selection.index });
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
	if (selection.type === 'marker') data = markers.find((m) => m._id === selection.id);
	if (selection.type === 'path') data = paths.find((p) => p._id === selection.id);
	if (selection.type === 'area') data = areas.find((a) => a._id === selection.id);
	if (selection.type === 'overlay') data = overlays.find((o) => o._id === selection.id);

	if (!data && selection.type !== 'overlay') return null;

	if (selection.type === 'marker') {
		return (
			// Note: MarkerForm handles its own layout, no wrapper needed
			<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
				<MarkerForm
					data={data}
					onChange={(field, val) => dispatch({ type: 'UPDATE_MARKER', id: selection.id, updates: { [field]: val } })}
					onDelete={handleDelete}
					onClose={handleClose}
				/>
			</div>
		);
	}

	if (selection.type === 'path') {
		return (
			<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
				<PathForm
					data={data}
					onChange={(field, val) => dispatch({ type: 'UPDATE_PATH', id: selection.id, updates: { [field]: val } })}
					onDelete={handleDelete}
					onClose={handleClose}
				/>
			</div>
		);
	}

	if (selection.type === 'area') {
		return (
			<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
				<AreaForm
					data={data}
					onChange={(field, val) => dispatch({ type: 'UPDATE_AREA', id: selection.id, updates: { [field]: val } })}
					onDelete={handleDelete}
					onClose={handleClose}
				/>
			</div>
		);
	}

	// Overlay Form (Generic Fallback)
	return (
		<SidebarWrapper title='Edit Overlay' onDelete={handleDelete} onClose={handleClose}>
			<div className='space-y-4'>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Name</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.name || ''}
						onChange={(e) => dispatch({ type: 'UPDATE_OVERLAY', id: selection.id, updates: { name: e.target.value } })}
					/>
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Image</label>
					<SmartImageInput
						value={data.image || ''}
						onChange={(e) => dispatch({ type: 'UPDATE_OVERLAY', id: selection.id, updates: { image: e.target.value } })}
						placeholder='Select image...'
					/>
				</div>
				<div className='text-xs text-muted-foreground bg-muted p-2 rounded'>Use handles on map to resize.</div>
			</div>
		</SidebarWrapper>
	);
}
