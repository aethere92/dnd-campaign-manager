import React, { useState } from 'react';
import { Image as ImageIcon, X, Link as LinkIcon, Search } from 'lucide-react';
import { ADMIN_INPUT_CLASS } from './AdminFormStyles';
import ImageLibraryModal from './ImageLibraryModal';

const resolvePreviewUrl = (url) => {
	if (!url) return null;
	const cleanPath = url.replace(/(\.\.\/)+/g, '').replace(/^\//, '');
	return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export default function SmartImageInput({ value, onChange, placeholder, ...props }) {
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const previewUrl = resolvePreviewUrl(value);

	return (
		<div className='space-y-2'>
			<div className='flex gap-2 items-center'>
				<div className='relative flex-1 group'>
					<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50'>
						<LinkIcon size={14} />
					</div>
					<input
						type='text'
						className={`${ADMIN_INPUT_CLASS} pl-9 pr-20`} // Extra padding for buttons
						placeholder={placeholder || 'images/path/to/file.png'}
						value={value || ''}
						onChange={onChange}
						{...props}
					/>

					{/* Actions inside input */}
					<div className='absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5'>
						{value && (
							<button
								type='button'
								onClick={() => onChange({ target: { value: '' } })}
								className='p-1.5 text-muted-foreground hover:text-red-500 transition-colors'
								title='Clear'>
								<X size={14} />
							</button>
						)}
						<button
							type='button'
							onClick={() => setIsPickerOpen(true)}
							className='p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-all'
							title='Browse Library'>
							<Search size={14} strokeWidth={3} />
						</button>
					</div>
				</div>

				{/* Visual Preview */}
				<div className='shrink-0 w-10 h-10 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden shadow-sm'>
					{previewUrl ? (
						<img
							src={previewUrl}
							alt='Preview'
							className='w-full h-full object-cover'
							onError={(e) => {
								e.target.style.display = 'none';
							}}
						/>
					) : (
						<ImageIcon size={16} className='text-muted-foreground/20' />
					)}
				</div>
			</div>

			<ImageLibraryModal
				isOpen={isPickerOpen}
				onClose={() => setIsPickerOpen(false)}
				onSelect={(path) => onChange({ target: { value: path } })}
			/>
		</div>
	);
}
