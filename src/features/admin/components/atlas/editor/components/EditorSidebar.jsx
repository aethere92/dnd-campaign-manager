import React from 'react';
import { useAtlasEditor } from '../AtlasEditorContext';
import { MarkerForm, PathForm, AreaForm } from '../../AtlasForms';
import SmartImageInput from '@/features/admin/components/SmartImageInput'; // <--- Added Import
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import { Trash2, X } from 'lucide-react';

// Wrapper defined outside to prevent re-renders losing focus
const SidebarWrapper = ({ children, title, onDelete, onClose }) => (
	<div className='absolute top-4 right-4 bottom-4 w-96 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
		{/* Header */}
		<div className='flex justify-between items-center p-4 border-b border-border bg-muted/40 shrink-0'>
			<span className='font-bold text-sm uppercase flex items-center gap-2'>{title}</span>
			<div className='flex gap-1'>
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

		{/* Scrollable Content */}
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

	// --- SELECT DATA SOURCE ---
	let data = null;
	if (selection.type === 'marker') data = markers.find((m) => m._id === selection.id);
	if (selection.type === 'path') data = paths.find((p) => p._id === selection.id);
	if (selection.type === 'area') data = areas.find((a) => a._id === selection.id);
	if (selection.type === 'overlay') data = overlays.find((o) => o._id === selection.id);

	// If data disappeared (deleted), close sidebar
	if (!data && selection.type !== 'overlay') return null;

	// Special Case: Path Node Editor
	if (selection.type === 'path' && selection.index !== undefined) {
		const point = data.points[selection.index];
		return (
			<SidebarWrapper title={`Edit Path Node #${selection.index + 1}`} onClose={handleClose}>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Narrative Text</label>
					<textarea
						className={ADMIN_INPUT_CLASS}
						rows={4}
						value={point.text || ''}
						placeholder='Story event that happened here...'
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
			</SidebarWrapper>
		);
	}

	if (selection.type === 'marker') {
		return (
			<div className='absolute top-4 right-4 bottom-4 w-96 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
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
			<div className='absolute top-4 right-4 bottom-4 w-96 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
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
			<div className='absolute top-4 right-4 bottom-4 w-96 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto animate-in slide-in-from-right-4 duration-200'>
				<AreaForm
					data={data}
					onChange={(field, val) => dispatch({ type: 'UPDATE_AREA', id: selection.id, updates: { [field]: val } })}
					onDelete={handleDelete}
					onClose={handleClose}
				/>
			</div>
		);
	}

	// Default Fallback (Overlays)
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
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Image Selection</label>
					{/* Replaced generic input with SmartImageInput */}
					<SmartImageInput
						value={data.image || ''}
						onChange={(e) => dispatch({ type: 'UPDATE_OVERLAY', id: selection.id, updates: { image: e.target.value } })}
						placeholder='Select or type image path...'
					/>
				</div>

				<div className='p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-700 dark:text-blue-300'>
					<strong>How to Position:</strong>
					<ul className='list-disc pl-4 mt-1 space-y-1'>
						<li>Click the overlay on the map to select it.</li>
						<li>
							Drag the <strong>Center Handle</strong> to move.
						</li>
						<li>
							Drag the <strong>Corner Handles</strong> to resize.
						</li>
					</ul>
				</div>
			</div>
		</SidebarWrapper>
	);
}
