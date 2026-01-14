import React, { useEffect, useRef } from 'react';
import { useAtlasEditor } from '../AtlasEditorContext';
import { MapPin, Footprints, Hexagon, Type, X, Edit2, Copy, Trash2, EyeOff } from 'lucide-react';
import clsx from 'clsx';

// ==========================================
// 1. RADIAL MENU (Creation)
// ==========================================
const RadialMenu = ({ x, y, latlng, onClose, actions }) => {
	const handleCreate = (type) => {
		const id = crypto.randomUUID();
		const { lat, lng } = latlng;

		// 1. PIN (Marker)
		if (type === 'pin') {
			actions.setTool('markers');
			actions.addMarker({
				_id: id,
				lat,
				lng,
				label: 'New Marker',
				category: 'default',
				color: '#d97706',
				variant: 'large',
				shape: 'pin',
			});
		}
		// 2. LABEL (Text Marker)
		else if (type === 'label') {
			actions.setTool('markers');
			actions.addMarker({
				_id: id,
				lat,
				lng,
				label: 'New Label',
				category: 'default',
				color: '#ffffff',
				variant: 'text',
				scale: 1.5,
			});
		}
		// 3. REGION (Area) - Starts drawing immediately
		else if (type === 'area') {
			actions.setTool('areas');
			actions.addArea({
				_id: id,
				name: 'New Region',
				interiorColor: '#ff0000',
				points: [{ coordinates: [lat, lng] }], // Start with first point
			});
			// Auto-select to trigger draw mode in reducer
		}
		// 4. PATH - Starts drawing immediately
		else if (type === 'path') {
			actions.setTool('paths');
			actions.addPath({
				_id: id,
				name: 'New Path',
				color: '#d97706',
				points: [{ coordinates: [lat, lng], text: '' }], // Start with first point
			});
		}

		onClose();
	};

	const MenuItem = ({ icon: Icon, label, onClick, className }) => (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			className={clsx(
				'flex flex-col items-center justify-center gap-0.5 w-16 h-16 rounded-full hover:scale-110 transition-all active:scale-95 text-muted-foreground hover:text-primary absolute',
				className
			)}>
			<Icon size={20} strokeWidth={2} />
			<span className='text-[9px] font-bold uppercase tracking-wider'>{label}</span>
		</button>
	);

	// Half size of 160px = 80px offset
	return (
		<div
			className='fixed z-[9999] w-40 h-40 rounded-full bg-background/95 backdrop-blur-sm shadow-2xl border border-border flex items-center justify-center animate-in zoom-in-75 duration-150 origin-center'
			style={{ top: y - 80, left: x - 80 }}
			onContextMenu={(e) => e.preventDefault()}>
			{/* Slices positioned absolutely */}
			<MenuItem className='top-1' icon={MapPin} label='Pin' onClick={() => handleCreate('pin')} />
			<MenuItem className='right-1' icon={Hexagon} label='Region' onClick={() => handleCreate('area')} />
			<MenuItem className='bottom-1' icon={Type} label='Label' onClick={() => handleCreate('label')} />
			<MenuItem className='left-1' icon={Footprints} label='Path' onClick={() => handleCreate('path')} />

			{/* Center Close Button */}
			<button
				onClick={onClose}
				className='w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors border border-border z-10 shadow-sm'>
				<X size={16} />
			</button>

			{/* Visual Crosshair Lines */}
			<div className='absolute w-full h-px bg-border/50 top-1/2 left-0 -z-10' />
			<div className='absolute h-full w-px bg-border/50 left-1/2 top-0 -z-10' />
		</div>
	);
};

// ==========================================
// 2. LIST MENU (Entity Editing)
// ==========================================
const EntityMenu = ({ x, y, target, onClose, actions }) => {
	const { type, id, data } = target;

	const handleColor = (color) => {
		if (type === 'marker') actions.updateMarker(id, { color });
		else if (type === 'area') actions.updateArea(id, { interiorColor: color, lineColor: color });
		else if (type === 'path') actions.updatePath(id, { color });
	};

	const handleDelete = () => {
		if (type === 'marker') actions.deleteMarker(id);
		if (type === 'area') actions.deleteArea(id);
		if (type === 'path') actions.deletePath(id);
		onClose();
	};

	const handleDuplicate = () => {
		const newId = crypto.randomUUID();
		const offset = 0.5; // Slight offset to see copy

		if (type === 'marker') {
			actions.addMarker({
				...data,
				_id: newId,
				lat: data.lat + offset,
				lng: data.lng + offset,
				label: `${data.label} (Copy)`,
			});
		} else if (type === 'area') {
			const newPoints = data.points.map((p) => ({
				...p,
				coordinates: [p.coordinates[0] + offset, p.coordinates[1] + offset],
			}));
			actions.addArea({ ...data, _id: newId, points: newPoints, name: `${data.name} (Copy)` });
		}
		onClose();
	};

	const colors = ['#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#d946ef'];

	return (
		<div
			className='fixed z-[9999] w-48 bg-card border border-border shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col'
			style={{ top: y, left: x }}
			onContextMenu={(e) => e.preventDefault()}>
			<div className='p-2 border-b border-border bg-muted/30 grid grid-cols-4 gap-1'>
				{colors.map((c) => (
					<button
						key={c}
						onClick={() => handleColor(c)}
						className='w-6 h-6 rounded-full hover:scale-110 transition-transform border border-black/10 shadow-sm mx-auto'
						style={{ backgroundColor: c }}
					/>
				))}
			</div>
			<div className='py-1'>
				<button
					onClick={() => {
						actions.selectItem(type, id);
						onClose();
					}}
					className='flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-muted text-xs font-medium'>
					<Edit2 size={14} /> Edit {type}
				</button>
				<button
					onClick={handleDuplicate}
					className='flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-muted text-xs font-medium'>
					<Copy size={14} /> Duplicate
				</button>
				<div className='h-px bg-border my-1' />
				<button
					onClick={handleDelete}
					className='flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-red-500/10 text-xs font-medium text-red-600'>
					<Trash2 size={14} /> Remove
				</button>
			</div>
		</div>
	);
};

// ==========================================
// 3. MAIN CONTAINER
// ==========================================
export default function EditorContextMenu() {
	const { state, actions } = useAtlasEditor();
	const { contextMenu } = state;
	const ref = useRef(null);

	// Close on outside click
	useEffect(() => {
		if (!contextMenu) return;
		const clickCheck = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				actions.closeContextMenu();
			}
		};
		window.addEventListener('mousedown', clickCheck);
		return () => window.removeEventListener('mousedown', clickCheck);
	}, [contextMenu, actions]);

	if (!contextMenu) return null;

	// Safety bounds to keep menu on screen
	const { x, y } = contextMenu.position;
	const safeX = Math.min(window.innerWidth - 200, Math.max(10, x));
	const safeY = Math.min(window.innerHeight - 200, Math.max(10, y));

	return (
		<div ref={ref}>
			{contextMenu.type === 'map' && (
				<RadialMenu
					x={safeX}
					y={safeY}
					latlng={contextMenu.latlng}
					onClose={actions.closeContextMenu}
					actions={actions}
				/>
			)}
			{contextMenu.type === 'entity' && (
				<EntityMenu
					x={safeX}
					y={safeY}
					target={contextMenu.target}
					onClose={actions.closeContextMenu}
					actions={actions}
				/>
			)}
		</div>
	);
}
