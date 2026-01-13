import React, { useEffect, useRef } from 'react';
import { useAtlasEditor } from '../AtlasEditorContext';
import {
	MapPin,
	Footprints,
	Hexagon,
	Type,
	X,
	Edit2,
	Copy,
	Trash2,
	EyeOff,
	Link as LinkIcon,
	Plus,
} from 'lucide-react';
import clsx from 'clsx';

// ==========================================
// 1. RADIAL MENU (Map Context)
// ==========================================
const RadialMenu = ({ x, y, latlng, onClose, actions }) => {
	// Helper to trigger creation
	const create = (tool, extraData = {}) => {
		actions.setTool(tool);

		// Immediate creation logic based on type
		const id = crypto.randomUUID();
		if (tool === 'markers') {
			actions.addMarker({
				_id: id,
				lat: latlng.lat,
				lng: latlng.lng,
				label: 'New Marker',
				category: 'default',
				color: '#d97706',
				variant: 'large',
				shape: 'pin',
				...extraData,
			});
		} else if (tool === 'paths') {
			// For paths/areas, we switch to draw mode and set the first point?
			// Or just switch tool. Let's just switch tool for complex shapes,
			// but for Marker/Label we create immediately.
		} else if (tool === 'areas') {
			// Just switch tool
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
				'flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-full hover:bg-muted/80 hover:scale-105 transition-all active:scale-95 text-muted-foreground hover:text-primary',
				className
			)}>
			<Icon size={24} strokeWidth={1.5} />
			<span className='text-[10px] font-bold uppercase tracking-wider'>{label}</span>
		</button>
	);

	return (
		<div
			className='fixed z-[9999] w-64 h-64 rounded-full bg-background/95 backdrop-blur-sm shadow-2xl border border-border flex items-center justify-center animate-in zoom-in-50 duration-200'
			style={{ top: y - 128, left: x - 128 }}
			onContextMenu={(e) => e.preventDefault()}>
			{/* Top: Pin */}
			<div className='absolute top-2 left-1/2 -translate-x-1/2'>
				<MenuItem icon={MapPin} label='Pin' onClick={() => create('markers')} />
			</div>
			{/* Right: Region */}
			<div className='absolute right-2 top-1/2 -translate-y-1/2'>
				<MenuItem icon={Hexagon} label='Region' onClick={() => actions.setTool('areas')} />
			</div>
			{/* Bottom: Label */}
			<div className='absolute bottom-2 left-1/2 -translate-x-1/2'>
				<MenuItem
					icon={Type}
					label='Label'
					onClick={() => create('markers', { variant: 'text', label: 'New Label' })}
				/>
			</div>
			{/* Left: Path */}
			<div className='absolute left-2 top-1/2 -translate-y-1/2'>
				<MenuItem icon={Footprints} label='Path' onClick={() => actions.setTool('paths')} />
			</div>

			{/* Center: Close */}
			<button
				onClick={onClose}
				className='w-12 h-12 bg-muted rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors border border-border z-10 shadow-sm'>
				<X size={20} />
			</button>

			{/* Dividers for visual style */}
			<div className='absolute inset-0 rounded-full border border-border opacity-20 pointer-events-none' />
			<div className='absolute w-full h-px bg-border top-1/2 left-0 -z-10 opacity-30' />
			<div className='absolute h-full w-px bg-border left-1/2 top-0 -z-10 opacity-30' />
		</div>
	);
};

// ==========================================
// 2. ENTITY LIST MENU (Item Context)
// ==========================================
const EntityMenu = ({ x, y, target, onClose, actions }) => {
	const { type, id, data } = target;

	const handleDuplicate = () => {
		const newId = crypto.randomUUID();
		// Shift position slightly so it's visible
		const offset = 0.05;

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
		} else if (type === 'path') {
			const newPoints = data.points.map((p) => ({
				...p,
				coordinates: [p.coordinates[0] + offset, p.coordinates[1] + offset],
			}));
			actions.addPath({ ...data, _id: newId, points: newPoints, name: `${data.name} (Copy)` });
		}
		onClose();
	};

	const handleColor = (color) => {
		if (type === 'marker') actions.updateMarker(id, { color });
		else if (type === 'area') actions.updateArea(id, { interiorColor: color, lineColor: color });
		else if (type === 'path') actions.updatePath(id, { color });
		// Don't close, user might want to try multiple colors
	};

	const handleEdit = () => {
		actions.selectItem(type, id);
		onClose();
	};

	const handleDelete = () => {
		if (confirm('Delete this item?')) {
			if (type === 'marker') actions.deleteMarker(id);
			if (type === 'area') actions.deleteArea(id);
			if (type === 'path') actions.deletePath(id);
		}
		onClose();
	};

	const colors = ['#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#d946ef'];

	return (
		<div
			className='fixed z-[9999] w-56 bg-card border border-border shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col'
			style={{ top: y, left: x }}
			onContextMenu={(e) => e.preventDefault()}>
			{/* Quick Colors */}
			<div className='p-2 border-b border-border bg-muted/30 grid grid-cols-8 gap-1'>
				{colors.map((c) => (
					<button
						key={c}
						onClick={() => handleColor(c)}
						className='w-5 h-5 rounded-full hover:scale-110 transition-transform border border-black/10 shadow-sm'
						style={{ backgroundColor: c }}
						title={c}
					/>
				))}
			</div>

			{/* Actions */}
			<div className='py-1'>
				<button
					onClick={handleEdit}
					className='flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-muted text-xs font-medium text-foreground'>
					<Edit2 size={14} className='text-muted-foreground' /> Edit {type}
				</button>
				<button
					onClick={handleDuplicate}
					className='flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-muted text-xs font-medium text-foreground'>
					<Copy size={14} className='text-muted-foreground' /> Duplicate
				</button>
				<button
					onClick={() => {
						actions.toggleVisibility(type + 's');
						onClose();
					}}
					className='flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-muted text-xs font-medium text-foreground'>
					<EyeOff size={14} className='text-muted-foreground' /> Hide Layer
				</button>

				<div className='h-px bg-border my-1' />

				<button
					onClick={handleDelete}
					className='flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-red-500/10 text-xs font-medium text-red-600'>
					<Trash2 size={14} /> Remove
				</button>
			</div>
		</div>
	);
};

// ==========================================
// 3. MAIN CONTAINER
// ==========================================
export default function AtlasContextMenu() {
	const { state, actions } = useAtlasEditor();
	const { contextMenu } = state;
	const ref = useRef(null);

	// Close on click outside
	useEffect(() => {
		if (!contextMenu) return;

		const handleClick = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				actions.closeContextMenu();
			}
		};

		// Slight delay to prevent immediate closing from the trigger click if it propagates
		setTimeout(() => window.addEventListener('mousedown', handleClick), 10);
		return () => window.removeEventListener('mousedown', handleClick);
	}, [contextMenu, actions]);

	if (!contextMenu) return null;

	// Prevent menu from going off-screen
	const { x, y } = contextMenu.position;

	// Simple bounds check (logic can be improved for edge cases)
	const safeX = Math.min(window.innerWidth - 250, Math.max(10, x));
	const safeY = Math.min(window.innerHeight - 300, Math.max(10, y));

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
