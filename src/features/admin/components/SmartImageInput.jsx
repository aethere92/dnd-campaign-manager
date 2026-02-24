import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Link, X, AlertCircle, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
// Import the library modal (assuming it exists in the same directory based on file structure)
import ImageLibraryModal from './ImageLibraryModal';

export default function SmartImageInput({ value, onChange, placeholder, className }) {
	// 1. Initialize safely
	const [inputValue, setInputValue] = useState(value || '');
	const [isValid, setIsValid] = useState(true);
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);

	// 2. Sync with parent value
	useEffect(() => {
		setInputValue(value || '');
	}, [value]);

	const handleChange = (e) => {
		const val = e.target.value;
		setInputValue(val);
		if (onChange) onChange(e);
	};

	const handleClear = () => {
		setInputValue('');
		if (onChange) onChange({ target: { value: '' } });
	};

	const handleLibrarySelect = (image) => {
		// Handle both string URLs and image objects
		const url = typeof image === 'string' ? image : image.url || image.path;

		if (url) {
			setInputValue(url);
			if (onChange) onChange({ target: { value: url } });
		}
		setIsLibraryOpen(false);
	};

	// 3. Derived State & Validation
	const safeVal = (inputValue || '').toString();
	const hasValue = safeVal.length > 0;

	const isExternal = safeVal.toLowerCase().startsWith('http') || safeVal.startsWith('data:');

	// Resolve Preview URL
	const previewUrl = hasValue
		? isExternal
			? safeVal
			: `${import.meta.env.BASE_URL}${safeVal.replace(/^\//, '')}`
		: null;

	return (
		<div className={clsx('space-y-2', className)}>
			<div className='flex items-center gap-2'>
				<div className='relative flex-1 group'>
					<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'>
						{isExternal ? <Link size={14} /> : <ImageIcon size={14} />}
					</div>

					<input
						type='text'
						value={safeVal}
						onChange={handleChange}
						placeholder={placeholder || 'Image URL...'}
						className={clsx(
							'w-full bg-card border border-border rounded-md py-2 pl-9 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all truncate',
							!isValid && 'border-red-500 focus:ring-red-500'
						)}
					/>

					{hasValue && (
						<button
							onClick={handleClear}
							className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm hover:bg-muted'
							title='Clear'>
							<X size={12} />
						</button>
					)}
				</div>

				{/* BROWSE BUTTON */}
				<button
					type='button'
					onClick={() => setIsLibraryOpen(true)}
					className='flex items-center justify-center w-9 h-9 bg-muted border border-border rounded-md hover:bg-muted/80 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all shadow-sm'
					title='Browse Library'>
					<FolderOpen size={16} />
				</button>
			</div>

			{/* PREVIEW */}
			{hasValue && (
				<div className='relative w-full h-32 bg-muted/30 rounded-md border border-border/50 overflow-hidden flex items-center justify-center p-2'>
					<img
						src={previewUrl}
						alt='Preview'
						className='w-full h-full object-contain'
						onError={() => setIsValid(false)}
						onLoad={() => setIsValid(true)}
					/>

					{!isValid && (
						<div className='absolute inset-0 flex flex-col items-center justify-center bg-background/90 text-red-500 gap-1 p-4 text-center'>
							<AlertCircle size={20} />
							<span className='text-[10px] font-bold uppercase tracking-wider'>Failed to load image</span>
							<span className='text-[10px] opacity-70 break-all'>{previewUrl}</span>
						</div>
					)}
				</div>
			)}

			{/* LIBRARY MODAL */}
			{isLibraryOpen && (
				<ImageLibraryModal
					isOpen={isLibraryOpen}
					onClose={() => setIsLibraryOpen(false)}
					onSelect={handleLibrarySelect}
				/>
			)}
		</div>
	);
}
