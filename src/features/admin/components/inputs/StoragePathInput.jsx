import React, { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabaseClient';
import { Folder, ChevronRight, CornerLeftUp, Check, Loader2, Search } from 'lucide-react';
import { Drawer } from '@/shared/components/ui/Drawer'; // Re-using your existing Drawer
import { ADMIN_INPUT_CLASS } from '../AdminFormStyles';
import Button from '@/shared/components/ui/Button';

const BUCKET_NAME = 'atlas'; // Hardcoded based on your URLs
const BASE_URL_PREFIX = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// --- THE MODAL CONTENT ---
const StorageBrowser = ({ onSelect, onClose }) => {
	const [path, setPath] = useState(''); // Current folder path (e.g. 'maps/khorinis/')
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Load items whenever path changes
	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			setError(null);
			try {
				const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
					limit: 100,
					sortBy: { column: 'name', order: 'asc' },
				});

				if (error) throw error;

				// Separate Folders vs Files
				// In Supabase Storage, "Folders" usually don't have an ID, or we check structure
				// But mostly we just want to let you navigate.
				// Tiles usually have extensions (.webp). Folders don't.
				const folders = data.filter((item) => !item.metadata); // Items without metadata are usually folders
				const files = data.filter((item) => item.metadata);

				setItems({ folders, files });
			} catch (err) {
				console.error(err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [path]);

	const handleNavigate = (folderName) => {
		setPath((prev) => (prev ? `${prev}/${folderName}` : folderName));
	};

	const handleUp = () => {
		if (!path) return;
		const parts = path.split('/');
		parts.pop(); // Remove last segment
		setPath(parts.length > 0 ? parts.join('/') : '');
	};

	const confirmSelection = () => {
		// Construct the final public URL
		// We remove trailing slashes to be clean
		const cleanPath = path.replace(/\/$/, '');
		const fullUrl = `${BASE_URL_PREFIX}${cleanPath}`;
		onSelect(fullUrl);
	};

	return (
		<div className='flex flex-col h-full pb-4'>
			{/* Header: Breadcrumbs & Up Button */}
			<div className='flex items-center gap-2 mb-4 bg-muted/30 p-2 rounded-md border border-border'>
				<button
					onClick={handleUp}
					disabled={!path}
					className='p-1.5 hover:bg-background rounded-md disabled:opacity-30 transition-colors'
					title='Go Up'>
					<CornerLeftUp size={16} />
				</button>
				<div className='font-mono text-xs flex-1 truncate select-all'>
					{BUCKET_NAME}/{path || ''}
				</div>
			</div>

			{/* Folder List */}
			<div className='flex-1 overflow-y-auto custom-scrollbar min-h-[300px] border border-border rounded-md bg-background'>
				{loading ? (
					<div className='flex items-center justify-center h-full text-muted-foreground gap-2'>
						<Loader2 className='animate-spin' size={20} /> Loading...
					</div>
				) : error ? (
					<div className='p-4 text-red-500 text-xs'>{error}</div>
				) : items.folders?.length === 0 && items.files?.length === 0 ? (
					<div className='p-8 text-center text-muted-foreground text-xs italic'>Empty Folder</div>
				) : (
					<div className='divide-y divide-border/50'>
						{/* Render Folders */}
						{items.folders?.map((folder) => (
							<button
								key={folder.name}
								onClick={() => handleNavigate(folder.name)}
								className='w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left group'>
								<Folder size={18} className='text-amber-500 fill-amber-500/20' />
								<span className='text-sm font-medium flex-1'>{folder.name}</span>
								<ChevronRight size={14} className='text-muted-foreground opacity-50 group-hover:opacity-100' />
							</button>
						))}

						{/* Optional: Show file count or greyed out files just for context */}
						{items.files?.length > 0 && (
							<div className='p-3 text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/10'>
								{items.files.length} Files (Tiles)
							</div>
						)}
					</div>
				)}
			</div>

			{/* Footer Action */}
			<div className='pt-4 mt-auto border-t border-border'>
				<Button fullWidth variant='primary' icon={Check} onClick={confirmSelection}>
					Select This Folder
				</Button>
				<p className='text-[10px] text-center text-muted-foreground mt-2'>
					Selected path: <strong>{path || '(Root)'}</strong>
				</p>
			</div>
		</div>
	);
};

// --- MAIN INPUT COMPONENT ---
export default function StoragePathInput({ value, onChange, placeholder }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div className='flex gap-2'>
				<input
					type='text'
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className={`${ADMIN_INPUT_CLASS} font-mono text-[11px]`}
				/>
				<Button
					type='button'
					variant='secondary'
					icon={Search}
					onClick={() => setIsOpen(true)}
					className='shrink-0'
					title='Browse Storage'>
					Browse
				</Button>
			</div>

			<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title='Select Map Tile Folder' position='right'>
				<div className='p-4 h-full'>
					<StorageBrowser
						onSelect={(url) => {
							onChange(url);
							setIsOpen(false);
						}}
						onClose={() => setIsOpen(false)}
					/>
				</div>
			</Drawer>
		</>
	);
}
