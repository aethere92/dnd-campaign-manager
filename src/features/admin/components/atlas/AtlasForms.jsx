import React from 'react';
import { Trash2, Info, Plus, X } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';

// --- SHARED HEADER ---
const Header = ({ title, onDelete }) => (
	<div className='flex justify-between items-center p-3 border-b border-border bg-muted/30'>
		<span className='font-bold text-sm uppercase'>{title}</span>
		<button
			onClick={onDelete}
			className='text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors'>
			<Trash2 size={16} />
		</button>
	</div>
);

// --- MARKER FORM ---
export const MarkerForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;
	return (
		<div className='flex flex-col h-full bg-card border-l border-border w-80 shadow-xl z-[1001]'>
			<Header title='Edit Marker' onDelete={onDelete} />
			<div className='p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar'>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Label</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.label || ''}
						onChange={(e) => onChange('label', e.target.value)}
						autoFocus
					/>
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Category</label>
					<select
						className={ADMIN_INPUT_CLASS}
						value={data.category || 'default'}
						onChange={(e) => onChange('category', e.target.value)}>
						<option value='default'>Default</option>
						<option value='cities'>Cities & Towns</option>
						<option value='locations'>Locations</option>
						<option value='points_of_interest'>Points of Interest</option>
						<option value='combat_encounters'>Combat / Danger</option>
						<option value='quests'>Quest Objectives</option>
					</select>
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Map Link (Child Key)</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.mapLink || ''}
						placeholder='e.g. korinis_dungeon'
						onChange={(e) => onChange('mapLink', e.target.value)}
					/>
				</div>
			</div>
			<div className='p-3 border-t border-border bg-muted/10'>
				<Button fullWidth variant='secondary' size='sm' onClick={onClose}>
					Done
				</Button>
			</div>
		</div>
	);
};

// --- PATH FORM (Sessions) ---
export const PathForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;
	return (
		<div className='flex flex-col h-full bg-card border-l border-border w-80 shadow-xl z-[1001]'>
			<Header title='Edit Path / Session' onDelete={onDelete} />
			<div className='p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='bg-blue-500/10 border border-blue-200 p-2 rounded text-xs text-blue-800 mb-2'>
					Drag the <strong>white dots</strong> on the map to reshape the path.
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Name / Session Title</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.name || ''}
						onChange={(e) => onChange('name', e.target.value)}
					/>
				</div>
				<div className='grid grid-cols-2 gap-2'>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground'>Color</label>
						<input
							type='color'
							className='w-full h-9 p-1 bg-background border border-border rounded cursor-pointer'
							value={data.lineColor || '#d97706'}
							onChange={(e) => onChange('lineColor', e.target.value)}
						/>
					</div>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground'>Opacity</label>
						<input
							type='number'
							step='0.1'
							min='0.1'
							max='1'
							className={ADMIN_INPUT_CLASS}
							value={data.opacity || 0.7}
							onChange={(e) => onChange('opacity', parseFloat(e.target.value))}
						/>
					</div>
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Dash Array</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.dashArray || ''}
						placeholder='e.g. 10, 10'
						onChange={(e) => onChange('dashArray', e.target.value)}
					/>
					<div className='text-[9px] text-muted-foreground mt-1'>Leave empty for solid line.</div>
				</div>
			</div>
			<div className='p-3 border-t border-border bg-muted/10'>
				<Button fullWidth variant='secondary' size='sm' onClick={onClose}>
					Done
				</Button>
			</div>
		</div>
	);
};

// --- AREA FORM (Regions) ---
export const AreaForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;
	return (
		<div className='flex flex-col h-full bg-card border-l border-border w-80 shadow-xl z-[1001]'>
			<Header title='Edit Region / Area' onDelete={onDelete} />
			<div className='p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='bg-purple-500/10 border border-purple-200 p-2 rounded text-xs text-purple-800 mb-2'>
					Drag the <strong>white dots</strong> to reshape the polygon.
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Region Name</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.name || ''}
						onChange={(e) => onChange('name', e.target.value)}
					/>
				</div>
				<div className='grid grid-cols-2 gap-2'>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground'>Border Color</label>
						<input
							type='color'
							className='w-full h-9 p-1 bg-background border border-border rounded cursor-pointer'
							value={data.lineColor || '#ffffff'}
							onChange={(e) => onChange('lineColor', e.target.value)}
						/>
					</div>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground'>Fill Color</label>
						<input
							type='color'
							className='w-full h-9 p-1 bg-background border border-border rounded cursor-pointer'
							value={data.interiorColor || '#ff0000'}
							onChange={(e) => onChange('interiorColor', e.target.value)}
						/>
					</div>
				</div>
				<div>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Text Rotation (deg)</label>
					<input
						type='number'
						className={ADMIN_INPUT_CLASS}
						value={data.textRotation || 0}
						onChange={(e) => onChange('textRotation', parseFloat(e.target.value))}
					/>
				</div>
			</div>
			<div className='p-3 border-t border-border bg-muted/10'>
				<Button fullWidth variant='secondary' size='sm' onClick={onClose}>
					Done
				</Button>
			</div>
		</div>
	);
};
