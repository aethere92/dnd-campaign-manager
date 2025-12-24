import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { INPUT_CLASS } from './ui/FormStyles';

// Helper to make DB paths browser-friendly
const resolvePreviewUrl = (url) => {
	if (!url) return null;
	// Remove all ../ sequences
	const cleanPath = url.replace(/(\.\.\/)+/g, '').replace(/^\//, '');
	// Prepend the base URL (usually / or /dnd-campaign-manager/ depending on vite config)
	return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export default function SmartImageInput({ value, onChange, placeholder, ...props }) {
	const previewUrl = resolvePreviewUrl(value);

	return (
		<div className='flex gap-3 items-start'>
			<div className='flex-1'>
				<input
					type='text'
					className={INPUT_CLASS}
					placeholder={placeholder || 'images/icons/...'}
					value={value || ''}
					onChange={onChange}
					{...props}
				/>
				<p className='text-[10px] text-muted-foreground mt-1'>Value stored in DB: {value}</p>
			</div>

			{/* Live Preview Box */}
			<div className='shrink-0 w-10 h-10 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shadow-sm bg-white'>
				{previewUrl ? (
					<img
						src={previewUrl}
						alt='Preview'
						className='w-full h-full object-contain'
						onError={(e) => {
							e.target.style.display = 'none';
						}}
					/>
				) : (
					<ImageIcon size={16} className='text-muted-foreground/50' />
				)}
			</div>
		</div>
	);
}
