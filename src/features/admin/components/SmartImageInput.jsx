import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Image as ImageIcon, X, Link as LinkIcon, Search, Check, AlertTriangle, FileImage } from 'lucide-react';
import { ADMIN_INPUT_CLASS } from './AdminFormStyles';
import ImageLibraryModal from './ImageLibraryModal';
import imageManifest from '@/features/admin/config/imageManifest.json';

const resolvePreviewUrl = (url) => {
	if (!url) return null;
	const cleanPath = url.replace(/(\.\.\/)+/g, '').replace(/^\//, '');
	return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export default function SmartImageInput({ value, onChange, placeholder, ...props }) {
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [inputValue, setInputValue] = useState(value || '');
	const containerRef = useRef(null);

	// Sync local input with parent value
	useEffect(() => {
		setInputValue(value || '');
	}, [value]);

	// 1. Flatten the Manifest for Search
	const flatManifest = useMemo(() => {
		const list = [];
		imageManifest.forEach((cat) => {
			cat.files.forEach((file) => {
				list.push({
					name: file,
					path: cat.path + file,
					category: cat.category,
				});
			});
		});
		return list;
	}, []);

	// 2. Validate Current Value
	const isValidPath = useMemo(() => {
		if (!inputValue) return null; // Neutral
		return flatManifest.some((item) => item.path === inputValue);
	}, [inputValue, flatManifest]);

	// 3. Filter Suggestions
	const suggestions = useMemo(() => {
		if (!inputValue || isValidPath) return []; // Don't suggest if empty or already valid
		const lower = inputValue.toLowerCase();
		return flatManifest
			.filter((item) => item.name.toLowerCase().includes(lower) || item.path.toLowerCase().includes(lower))
			.slice(0, 5); // Limit to 5
	}, [inputValue, isValidPath, flatManifest]);

	// Close suggestions on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setShowSuggestions(false);
				setIsFocused(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSelectSuggestion = (path) => {
		setInputValue(path);
		onChange({ target: { value: path } });
		setShowSuggestions(false);
	};

	const handleInputChange = (e) => {
		const newVal = e.target.value;
		setInputValue(newVal);
		onChange(e);
		setShowSuggestions(true);
	};

	// Pretty display logic
	const displayValue =
		!isFocused && inputValue && isValidPath
			? inputValue.split('/').pop() // Show filename only when blurred & valid
			: inputValue;

	const previewUrl = resolvePreviewUrl(inputValue);

	return (
		<div className='space-y-2' ref={containerRef}>
			<div className='flex gap-2 items-center'>
				<div className='relative flex-1 group'>
					{/* Icon Indicator */}
					<div className='absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none'>
						{isValidPath === true ? (
							<Check size={14} className='text-emerald-500' />
						) : isValidPath === false && inputValue ? (
							<AlertTriangle size={14} className='text-amber-500' />
						) : (
							<LinkIcon size={14} className='text-muted-foreground/50' />
						)}
					</div>

					<input
						type='text'
						className={`${ADMIN_INPUT_CLASS} pl-9 pr-20 transition-all ${
							!isFocused && isValidPath ? 'text-primary font-medium bg-primary/5' : ''
						}`}
						placeholder={placeholder || 'Search images...'}
						value={displayValue}
						onChange={handleInputChange}
						onFocus={() => {
							setIsFocused(true);
							setShowSuggestions(true);
							setInputValue(value || ''); // Ensure we edit the full path
						}}
						onBlur={() => {
							// Delay blur to allow click on suggestion
							setTimeout(() => setIsFocused(false), 200);
						}}
						{...props}
					/>

					{/* Pretty Filename Badge (Only visual hint if valid) */}
					{!isFocused && isValidPath && (
						<div className='absolute right-20 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border pointer-events-none'>
							{flatManifest
								.find((i) => i.path === inputValue)
								?.category.split('>')
								.pop()
								.trim()}
						</div>
					)}

					{/* Actions inside input */}
					<div className='absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5'>
						{inputValue && (
							<button
								type='button'
								onClick={() => {
									setInputValue('');
									onChange({ target: { value: '' } });
								}}
								className='p-1.5 text-muted-foreground hover:text-red-500 transition-colors'
								title='Clear'>
								<X size={14} />
							</button>
						)}
						<button
							type='button'
							onClick={() => setIsPickerOpen(true)}
							className='p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 rounded-md transition-all'
							title='Browse Library'>
							<Search size={14} strokeWidth={3} />
						</button>
					</div>

					{/* AUTOCOMPLETE DROPDOWN */}
					{showSuggestions && suggestions.length > 0 && (
						<div className='absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden'>
							<div className='text-[10px] uppercase font-bold text-muted-foreground px-3 py-1 bg-muted/30'>
								Suggested Files
							</div>
							{suggestions.map((item) => (
								<button
									key={item.path}
									type='button'
									onClick={() => handleSelectSuggestion(item.path)}
									className='flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors border-b border-border/40 last:border-0'>
									<div className='w-8 h-8 rounded bg-muted shrink-0 overflow-hidden border border-border/50'>
										<img
											src={`${import.meta.env.BASE_URL}${item.path}`}
											className='w-full h-full object-cover'
											loading='lazy'
										/>
									</div>
									<div className='min-w-0'>
										<div className='text-sm font-medium text-foreground truncate'>{item.name}</div>
										<div className='text-[10px] text-muted-foreground truncate'>{item.category}</div>
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Visual Preview Box */}
				<div
					className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center overflow-hidden shadow-sm transition-colors ${
						isValidPath ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-card'
					}`}>
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
				onSelect={(path) => {
					setInputValue(path);
					onChange({ target: { value: path } });
				}}
				initialSearch={inputValue.split('/').pop() || ''} // Auto-search current value in modal
			/>
		</div>
	);
}
