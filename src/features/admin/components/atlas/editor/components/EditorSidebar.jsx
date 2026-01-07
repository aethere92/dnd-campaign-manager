import React from 'react';
import { Trash2, X } from 'lucide-react';
import { useAtlasEditor } from '../AtlasEditorContext';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import Button from '@/shared/components/ui/Button';

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

	if (!data) return null;

	// --- PATH POINT EDITOR (Special Case) ---
	if (selection.type === 'path' && selection.index !== undefined) {
		const point = data.points[selection.index];
		return (
			<SidebarShell
				title='Edit Path Node'
				onClose={handleClose}
				onDelete={() => {
					/* maybe delete point logic later */
				}}>
				<div className='space-y-4'>
					<div className='text-xs text-muted-foreground'>Node #{selection.index + 1}</div>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground'>Coordinates</label>
						<div className='flex gap-2'>
							<input className={ADMIN_INPUT_CLASS} disabled value={point.coordinates[0]} />
							<input className={ADMIN_INPUT_CLASS} disabled value={point.coordinates[1]} />
						</div>
					</div>
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
				</div>
			</SidebarShell>
		);
	}

	// --- GENERIC EDITORS ---
	return (
		<SidebarShell title={`Edit ${selection.type}`} onClose={handleClose} onDelete={handleDelete}>
			<div className='space-y-4'>
				{/* NAME / LABEL */}
				{selection.type !== 'overlay' && (
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground'>
							{selection.type === 'marker' ? 'Label' : 'Name'}
						</label>
						<input
							className={ADMIN_INPUT_CLASS}
							value={data.label || data.name || ''}
							onChange={(e) => {
								const field = selection.type === 'marker' ? 'label' : 'name';
								dispatch({
									type: `UPDATE_${selection.type.toUpperCase()}`,
									id: selection.id,
									updates: { [field]: e.target.value },
								});
							}}
						/>
					</div>
				)}

				{/* MARKER SPECIFIC */}
				{selection.type === 'marker' && (
					<>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground'>Category</label>
							<select
								className={ADMIN_INPUT_CLASS}
								value={data.category || 'default'}
								onChange={(e) =>
									dispatch({ type: 'UPDATE_MARKER', id: selection.id, updates: { category: e.target.value } })
								}>
								<option value='default'>Default</option>
								<option value='cities'>Cities</option>
								<option value='locations'>Locations</option>
								<option value='points_of_interest'>POIs</option>
								<option value='combat_encounters'>Combat</option>
							</select>
						</div>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground'>Map Link</label>
							<input
								className={ADMIN_INPUT_CLASS}
								value={data.mapLink || ''}
								onChange={(e) =>
									dispatch({ type: 'UPDATE_MARKER', id: selection.id, updates: { mapLink: e.target.value } })
								}
							/>
						</div>
					</>
				)}

				{/* PATH SPECIFIC */}
				{selection.type === 'path' && (
					<div className='grid grid-cols-2 gap-2'>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground'>Color</label>
							<input
								type='color'
								className='w-full h-8'
								value={data.lineColor || '#d97706'}
								onChange={(e) =>
									dispatch({ type: 'UPDATE_PATH', id: selection.id, updates: { lineColor: e.target.value } })
								}
							/>
						</div>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground'>Style</label>
							<input
								className={ADMIN_INPUT_CLASS}
								placeholder='Dash array (5,5)'
								value={data.dashArray || ''}
								onChange={(e) =>
									dispatch({ type: 'UPDATE_PATH', id: selection.id, updates: { dashArray: e.target.value } })
								}
							/>
						</div>
					</div>
				)}

				{/* OVERLAY SPECIFIC */}
				{selection.type === 'overlay' && (
					<>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground'>Name</label>
							<input
								className={ADMIN_INPUT_CLASS}
								value={data.name || ''}
								onChange={(e) =>
									dispatch({ type: 'UPDATE_OVERLAY', id: selection.id, updates: { name: e.target.value } })
								}
							/>
						</div>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground'>Image URL</label>
							<input
								className={ADMIN_INPUT_CLASS}
								value={data.image || ''}
								onChange={(e) =>
									dispatch({ type: 'UPDATE_OVERLAY', id: selection.id, updates: { image: e.target.value } })
								}
							/>
						</div>
						<div className='bg-muted p-2 rounded text-[10px]'>
							<div className='font-bold'>Bounds:</div>
							<div>
								TL: {data.bounds[0][0]}, {data.bounds[0][1]}
							</div>
							<div>
								BR: {data.bounds[1][0]}, {data.bounds[1][1]}
							</div>
							<div className='text-muted-foreground mt-1'>
								Edit bounds manually in JSON if needed, or drag corners (todo).
							</div>
						</div>
					</>
				)}
			</div>
		</SidebarShell>
	);
}

const SidebarShell = ({ title, children, onClose, onDelete }) => (
	<div className='absolute top-4 right-4 bottom-4 w-80 bg-card border border-border shadow-2xl rounded-lg flex flex-col z-[1001] pointer-events-auto'>
		<div className='flex justify-between items-center p-3 border-b border-border bg-muted/30'>
			<span className='font-bold text-sm uppercase'>{title}</span>
			<div className='flex gap-1'>
				<button onClick={onDelete} className='p-1 text-red-500 hover:bg-red-50 rounded'>
					<Trash2 size={16} />
				</button>
				<button onClick={onClose} className='p-1 text-muted-foreground hover:bg-muted rounded'>
					<X size={16} />
				</button>
			</div>
		</div>
		<div className='p-4 flex-1 overflow-y-auto custom-scrollbar'>{children}</div>
	</div>
);
