import React, { useState } from 'react';
import { Search, Image as ImageIcon, FolderOpen, RefreshCw } from 'lucide-react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { ADMIN_INPUT_CLASS } from './AdminFormStyles';
// IMPORT THE GENERATED FILE
import imageLibraryData from '../config/imageManifest.json';

export default function ImageLibraryModal({ isOpen, onClose, onSelect }) {
	const [searchTerm, setSearchTerm] = useState('');

	// Use the dynamic data from the script
	const filteredLibrary = imageLibraryData
		.map((cat) => ({
			...cat,
			files: cat.files.filter((f) => f.toLowerCase().includes(searchTerm.toLowerCase())),
		}))
		.filter((cat) => cat.files.length > 0);

	return (
		<Drawer isOpen={isOpen} onClose={onClose} title='Image Library' position='right'>
			<div className='p-4 space-y-6'>
				<div className='relative'>
					<Search className='absolute left-3 top-2.5 text-muted-foreground' size={14} />
					<input
						type='text'
						placeholder='Search for image or category...'
						className={ADMIN_INPUT_CLASS + ' pl-9'}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						autoFocus
					/>
				</div>

				<div className='space-y-8 pb-20'>
					{filteredLibrary.map((group) => (
						<div key={group.category} className='space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-300'>
							<h3 className='text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2'>
								<FolderOpen size={10} className='text-amber-600' />
								{group.category}
								<span className='text-[8px] font-normal lowercase tracking-normal bg-muted px-1.5 rounded-full'>
									{group.files.length} images
								</span>
							</h3>

							<div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
								{group.files.map((file) => {
									const fullPath = `${group.path}${file}`;
									const previewUrl = `${import.meta.env.BASE_URL}${fullPath}`;

									return (
										<button
											key={file}
											type='button'
											title={file}
											onClick={() => {
												onSelect(fullPath);
												onClose();
											}}
											className='group relative aspect-square rounded-md border border-border bg-card overflow-hidden hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 transition-all shadow-sm'>
											<img
												src={previewUrl}
												alt={file}
												className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
												loading='lazy'
											/>
											{/* Hover Overlay with filename */}
											<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1'>
												<p className='text-[7px] text-white truncate w-full text-center font-mono'>{file}</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					))}

					{filteredLibrary.length === 0 && (
						<div className='text-center py-20 opacity-30 flex flex-col items-center'>
							<ImageIcon size={40} strokeWidth={1} />
							<p className='text-xs mt-2'>No matching images found.</p>
						</div>
					)}
				</div>
			</div>
		</Drawer>
	);
}
