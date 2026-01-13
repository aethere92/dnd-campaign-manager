import React from 'react';
import SmartImageInput from '@/features/admin/components/SmartImageInput';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import { Trash2, X } from 'lucide-react';

const Header = ({ title, onDelete, onClose }) => (
	<div className='flex justify-between items-center p-4 border-b border-border bg-muted/40 shrink-0'>
		<span className='font-bold text-sm uppercase flex items-center gap-2'>
			<div className='w-1.5 h-4 bg-primary rounded-full' />
			{title}
		</span>
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
);

export const OverlayForm = ({ data, actions, onClose }) => {
	if (!data) return null;

	const handleChange = (field, value) => {
		actions.updateOverlay(data._id, { [field]: value });
	};

	return (
		<div className='flex flex-col h-full bg-card shadow-2xl z-[1001] w-full border-l border-border'>
			<Header title='Overlay Properties' onDelete={() => actions.deleteOverlay(data._id)} onClose={onClose} />

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='space-y-3'>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Name</label>
						<input
							className={ADMIN_INPUT_CLASS}
							value={data.name || ''}
							onChange={(e) => handleChange('name', e.target.value)}
							placeholder='Overlay Name...'
						/>
					</div>
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Image Source</label>
						<SmartImageInput
							value={data.image || ''}
							onChange={(val) => handleChange('image', val)}
							placeholder='Select or paste image URL...'
						/>
					</div>
				</div>

				<div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-md'>
					<p className='text-xs text-blue-400'>
						<strong>Tip:</strong> Drag the corners of the image on the map to resize it. Drag the center handle to move
						it.
					</p>
				</div>
			</div>
		</div>
	);
};
