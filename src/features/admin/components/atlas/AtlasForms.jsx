import React, { useState, useEffect } from 'react';
import {
	Trash2,
	X,
	MapPin,
	Circle,
	Image as ImageIcon,
	Eye,
	EyeOff,
	MousePointer2,
	Link as LinkIcon,
	Type,
	Minus,
	Plus,
	Tag,
	Hexagon,
	Footprints,
	RotateCcw, // <--- Verified 'Tag' import
} from 'lucide-react';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import ShapeSelector from './ShapeSelector';
import VisualIconPicker from './VisualIconPicker';
import SegmentedControl from './SegmentedControl';
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';
import PathStylePopup from './PathStylePopup';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { fetchCampaignMaps } from '@/features/atlas/api/mapService';
import Button from '@/shared/components/ui/Button';

// --- Shared Header ---
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

// ==========================================
// 1. MARKER FORM
// ==========================================
export const MarkerForm = ({ data, onChange, onDelete, onClose }) => {
	const { campaignId } = useCampaign();
	const [mapOptions, setMapOptions] = useState([]);

	useEffect(() => {
		if (campaignId) {
			fetchCampaignMaps(campaignId).then(setMapOptions);
		}
	}, [campaignId]);

	const safeData = {
		label: '',
		color: '#d97706',
		variant: 'large',
		shape: 'pin',
		icon: 'default',
		category: 'default',
		labelDisplay: 'hover',
		scale: 1,
		mapLink: '',
		...data,
	};

	return (
		<div className='flex flex-col h-full bg-card shadow-2xl z-[1001] w-full border-l border-border'>
			<Header title='Marker Properties' onDelete={onDelete} onClose={onClose} />

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{/* 1. Identity & Grouping */}
				<div className='space-y-3'>
					<div className='flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm'>
						<div className='w-8 h-8 rounded bg-background flex items-center justify-center border border-border shrink-0'>
							<div
								className='w-4 h-4 rounded-full border border-black/10'
								style={{ backgroundColor: safeData.color }}
							/>
						</div>
						<input
							className='bg-transparent border-none focus:outline-none text-sm font-bold w-full'
							value={safeData.label}
							onChange={(e) => onChange('label', e.target.value)}
							placeholder='Marker Name...'
							autoFocus
						/>
					</div>

					<div className='flex items-center gap-2'>
						<Tag size={14} className='text-muted-foreground shrink-0' />
						<select
							className={ADMIN_INPUT_CLASS}
							value={safeData.category}
							onChange={(e) => onChange('category', e.target.value)}>
							<option value='default'>Default</option>
							<option value='locations'>Locations</option>
							<option value='cities'>Cities / Towns</option>
							<option value='pois'>Points of Interest</option>
							<option value='shops'>Shops</option>
							<option value='npcs'>NPCs</option>
							<option value='quests'>Quests</option>
							<option value='danger'>Danger / Combat</option>
						</select>
					</div>
				</div>

				{/* 2. Appearance */}
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<span className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>Appearance</span>
					</div>

					<SegmentedControl
						value={safeData.variant}
						onChange={(v) => onChange('variant', v)}
						options={[
							{ value: 'large', label: 'Pin', icon: MapPin },
							{ value: 'small', label: 'Dot', icon: Circle },
							{ value: 'icon', label: 'Icon', icon: ImageIcon },
							{ value: 'text', label: 'Text', icon: Type },
						]}
					/>

					{['large', 'small'].includes(safeData.variant) && (
						<div className='space-y-2'>
							<label className='text-[10px] text-muted-foreground'>Shape</label>
							<ShapeSelector value={safeData.shape} onChange={(v) => onChange('shape', v)} color={safeData.color} />
						</div>
					)}

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-1'>
							<label className='text-[10px] text-muted-foreground'>Color</label>
							<SmartColorPicker value={safeData.color} onChange={(v) => onChange('color', v)} />
						</div>

						{['large', 'icon'].includes(safeData.variant) && (
							<div className='space-y-1'>
								<label className='text-[10px] text-muted-foreground'>Icon</label>
								<VisualIconPicker value={safeData.icon} onChange={(v) => onChange('icon', v)} />
							</div>
						)}
					</div>

					<div className='space-y-2 pt-2'>
						<div className='flex justify-between'>
							<label className='text-[10px] text-muted-foreground'>Size / Scale</label>
							<span className='text-[10px] font-mono text-muted-foreground'>{safeData.scale.toFixed(1)}x</span>
						</div>
						<div className='flex items-center gap-3'>
							<Minus
								size={14}
								className='text-muted-foreground cursor-pointer hover:text-foreground'
								onClick={() => onChange('scale', Math.max(0.5, safeData.scale - 0.1))}
							/>
							<input
								type='range'
								min='0.5'
								max='2.0'
								step='0.1'
								value={safeData.scale}
								onChange={(e) => onChange('scale', parseFloat(e.target.value))}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
							<Plus
								size={14}
								className='text-muted-foreground cursor-pointer hover:text-foreground'
								onClick={() => onChange('scale', Math.min(2.0, safeData.scale + 0.1))}
							/>
						</div>
					</div>
				</div>

				<div className='h-px bg-border/50' />

				{/* 3. Behavior */}
				<div className='space-y-4'>
					<span className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>Display Behavior</span>

					<div className='space-y-2'>
						<label className='text-[10px] text-muted-foreground'>Label Visibility</label>
						<SegmentedControl
							value={safeData.labelDisplay}
							onChange={(v) => onChange('labelDisplay', v)}
							options={[
								{ value: 'always', label: 'Always', icon: Eye },
								{ value: 'hover', label: 'Hover', icon: MousePointer2 },
								{ value: 'none', label: 'Hidden', icon: EyeOff },
							]}
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-[10px] text-muted-foreground flex items-center gap-1'>
							<LinkIcon size={12} /> Map Link
						</label>
						<select
							className={ADMIN_INPUT_CLASS}
							value={safeData.mapLink || ''}
							onChange={(e) => onChange('mapLink', e.target.value)}>
							<option value=''>-- No Link --</option>
							{mapOptions.map((m) => (
								<option key={m.key} value={m.key}>
									{m.title} ({m.key})
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
		</div>
	);
};

// ==========================================
// 2. AREA FORM (Region)
// ==========================================
export const AreaForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;

	const safeData = {
		name: '',
		lineColor: '#d97706',
		interiorColor: '#d97706',
		fillOpacity: 0.2,
		labelColor: '#ffffff',
		fontSize: 16,
		textRotation: 0,
		labelBgColor: '#000000',
		labelBgOpacity: 0,
		...data,
	};

	return (
		<div className='flex flex-col h-full w-full border-l border-border bg-card shadow-2xl z-[1001]'>
			<Header title='Region Properties' onDelete={onDelete} onClose={onClose} />

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='space-y-3'>
					<div className='flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm'>
						<div className='w-8 h-8 rounded bg-background flex items-center justify-center border border-border shrink-0 text-muted-foreground'>
							<Hexagon size={16} />
						</div>
						<input
							className='bg-transparent border-none focus:outline-none text-sm font-bold w-full'
							value={safeData.name}
							onChange={(e) => onChange('name', e.target.value)}
							placeholder='Region Label...'
						/>
					</div>
				</div>

				<div className='space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>Polygon Style</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Stroke</label>
							<SmartColorPicker value={safeData.lineColor} onChange={(val) => onChange('lineColor', val)} />
						</div>
						<div>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Fill</label>
							<SmartColorPicker value={safeData.interiorColor} onChange={(val) => onChange('interiorColor', val)} />
						</div>
					</div>

					<div className='pt-2'>
						<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Fill Opacity</label>
						<div className='flex items-center gap-3'>
							<input
								type='range'
								min='0'
								max='1'
								step='0.1'
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								value={safeData.fillOpacity}
								onChange={(e) => onChange('fillOpacity', parseFloat(e.target.value))}
							/>
							<span className='text-xs font-mono w-8 text-right text-muted-foreground'>{safeData.fillOpacity}</span>
						</div>
					</div>
				</div>

				<div className='h-px bg-border/50' />

				<div className='space-y-4'>
					<div className='flex items-center gap-2'>
						<Type size={14} className='text-muted-foreground' />
						<div className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>Label Typography</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2'>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Text Color</label>
							<SmartColorPicker value={safeData.labelColor} onChange={(val) => onChange('labelColor', val)} />
						</div>
						<div>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Size (px)</label>
							<input
								type='number'
								className={ADMIN_INPUT_CLASS}
								value={safeData.fontSize}
								onChange={(e) => onChange('fontSize', Number(e.target.value))}
							/>
						</div>
						<div>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Rotate (°)</label>
							<input
								type='number'
								className={ADMIN_INPUT_CLASS}
								value={safeData.textRotation}
								onChange={(e) => onChange('textRotation', parseFloat(e.target.value))}
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4 items-end pt-2'>
						<div>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Background</label>
							<SmartColorPicker value={safeData.labelBgColor} onChange={(val) => onChange('labelBgColor', val)} />
						</div>
						<div className='space-y-1'>
							<label className='text-[10px] text-muted-foreground block'>BG Opacity</label>
							<input
								type='range'
								min='0'
								max='1'
								step='0.1'
								className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								value={safeData.labelBgOpacity}
								onChange={(e) => onChange('labelBgOpacity', parseFloat(e.target.value))}
							/>
						</div>
					</div>

					{safeData.labelPosition && (
						<div className='pt-4'>
							<Button
								variant='secondary'
								size='sm'
								icon={RotateCcw}
								fullWidth
								onClick={() => onChange('labelPosition', null)}>
								Reset Label Position
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// ==========================================
// 3. PATH FORM
// ==========================================
export const PathForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;

	const safeData = {
		name: '',
		color: '#d97706',
		opacity: 1,
		weight: 5,
		dashArray: '',
		curviness: 0,
		labelDisplay: 'hover',
		...data,
	};

	return (
		<div className='flex flex-col h-full bg-card shadow-2xl z-[1001] w-full border-l border-border'>
			<Header title='Path Properties' onDelete={onDelete} onClose={onClose} />

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{/* Name */}
				<div className='space-y-3'>
					<div className='flex items-center gap-2 bg-muted/30 p-2 rounded-md border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm'>
						<div className='w-8 h-8 rounded bg-background flex items-center justify-center border border-border shrink-0 text-muted-foreground'>
							<Footprints size={16} />
						</div>
						<input
							className='bg-transparent border-none focus:outline-none text-sm font-bold w-full'
							value={safeData.name}
							onChange={(e) => onChange('name', e.target.value)}
							placeholder='Path Name...'
						/>
					</div>
				</div>

				{/* Appearance Panel */}
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<span className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>Appearance</span>
					</div>

					<div className='flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border'>
						<div className='flex-1'>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Color</label>
							<SmartColorPicker value={safeData.color} onChange={(val) => onChange('color', val)} />
						</div>
						<div className='flex flex-col items-center'>
							<label className='text-[10px] text-muted-foreground mb-1 block'>Style</label>
							<PathStylePopup data={safeData} onChange={onChange} />
						</div>
					</div>
				</div>

				<div className='h-px bg-border/50' />

				{/* Behavior Panel */}
				<div className='space-y-4'>
					<span className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>Display Behavior</span>

					<div className='space-y-2'>
						<label className='text-[10px] text-muted-foreground'>Label Visibility</label>
						<SegmentedControl
							value={safeData.labelDisplay}
							onChange={(v) => onChange('labelDisplay', v)}
							options={[
								{ value: 'always', label: 'Always', icon: Eye },
								{ value: 'hover', label: 'Hover', icon: MousePointer2 },
								{ value: 'none', label: 'Hidden', icon: EyeOff },
							]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
