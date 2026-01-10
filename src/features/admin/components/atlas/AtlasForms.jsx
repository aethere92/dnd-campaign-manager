import React, { useState, useEffect } from 'react';
import {
	Trash2,
	X,
	Map as MapIcon,
	Link as LinkIcon,
	Flag,
	Circle,
	Square,
	Star,
	MapPin,
	RotateCcw,
} from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';
import { fetchCampaignMaps } from '@/features/atlas/api/mapService';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import clsx from 'clsx';

// --- ICONS PRESET ---
const ICON_OPTIONS = [
	{ value: 'default', label: 'Pin', icon: MapPin },
	{ value: 'flag', label: 'Flag', icon: Flag },
	{ value: 'star', label: 'Star', icon: Star },
	{ value: 'circle', label: 'Circle', icon: Circle },
	{ value: 'square', label: 'Square', icon: Square },
];

const Header = ({ title, onDelete, onClose }) => (
	<div className='flex justify-between items-center p-4 border-b border-border bg-muted/40 shrink-0'>
		<span className='font-bold text-sm uppercase flex items-center gap-2'>
			<div className='w-1.5 h-4 bg-primary rounded-full' />
			{title}
		</span>
		<div className='flex gap-1'>
			<button
				onClick={onDelete}
				className='p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors'
				title='Delete Item'>
				<Trash2 size={16} />
			</button>
			<button
				onClick={onClose}
				className='p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors'
				title='Close'>
				<X size={16} />
			</button>
		</div>
	</div>
);

// --- MARKER FORM ---
export const MarkerForm = ({ data, onChange, onDelete, onClose }) => {
	const { campaignId } = useCampaign();
	const [mapOptions, setMapOptions] = useState([]);

	useEffect(() => {
		if (campaignId) {
			fetchCampaignMaps(campaignId).then(setMapOptions);
		}
	}, [campaignId]);

	if (!data) return null;

	return (
		<div className='flex flex-col h-full bg-card shadow-2xl z-[1001] w-full'>
			<Header title='Edit Marker' onDelete={onDelete} onClose={onClose} />

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{/* 1. Content */}
				<div className='space-y-3'>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Label & Category</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.label || ''}
						onChange={(e) => onChange('label', e.target.value)}
						placeholder='Marker Label'
						autoFocus
					/>
					<select
						className={ADMIN_INPUT_CLASS}
						value={data.category || 'default'}
						onChange={(e) => onChange('category', e.target.value)}>
						<option value='default'>Default</option>
						<option value='cities'>City / Settlement</option>
						<option value='locations'>Location</option>
						<option value='points_of_interest'>Point of Interest</option>
						<option value='combat_encounters'>Combat / Danger</option>
						<option value='quests'>Quest Objective</option>
						<option value='npcs'>NPC</option>
					</select>
				</div>

				{/* 2. Visuals */}
				<div className='space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground'>Appearance</div>

					<SmartColorPicker label='Marker Color' value={data.color} onChange={(val) => onChange('color', val)} />

					<div className='grid grid-cols-2 gap-3 pt-2'>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Style</label>
							<div className='flex bg-background border border-border rounded-md p-0.5'>
								<button
									className={clsx(
										'flex-1 text-[10px] font-bold uppercase py-1.5 rounded-sm transition-colors',
										!data.iconType || data.iconType === 'pin'
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:text-foreground'
									)}
									onClick={() => onChange('iconType', 'pin')}>
									Pin
								</button>
								<button
									className={clsx(
										'flex-1 text-[10px] font-bold uppercase py-1.5 rounded-sm transition-colors',
										data.iconType === 'flat'
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:text-foreground'
									)}
									onClick={() => onChange('iconType', 'flat')}>
									Flat
								</button>
							</div>
						</div>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Icon</label>
							<select
								className={ADMIN_INPUT_CLASS}
								value={data.customIcon || 'default'}
								onChange={(e) => onChange('customIcon', e.target.value)}>
								{ICON_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* 3. Interaction */}
				<div className='space-y-3'>
					<label className='text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1'>
						<LinkIcon size={12} /> Map Link (Autocomplete)
					</label>
					<div className='relative'>
						<select
							className={ADMIN_INPUT_CLASS}
							value={data.mapLink || ''}
							onChange={(e) => onChange('mapLink', e.target.value)}>
							<option value=''>-- No Link --</option>
							{mapOptions.map((m) => (
								<option key={m.key} value={m.key}>
									{m.title} ({m.key})
								</option>
							))}
						</select>
						<MapIcon size={14} className='absolute right-3 top-2.5 text-muted-foreground pointer-events-none' />
					</div>
					<div className='text-[10px] text-muted-foreground/70'>
						Links allow users to double-click this marker to enter a sub-map.
					</div>
				</div>
			</div>
		</div>
	);
};

// --- PATH FORM ---
export const PathForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;
	return (
		<div className='flex flex-col h-full bg-card shadow-2xl z-[1001] w-full'>
			<Header title='Edit Path' onDelete={onDelete} onClose={onClose} />
			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='bg-blue-500/10 border border-blue-200/50 p-3 rounded-md text-xs text-blue-800 flex items-start gap-2'>
					<div className='mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0' />
					<span>
						Drag the <strong>white dots</strong> on the map to shape the path. Click a dot to edit its story text.
					</span>
				</div>

				<div className='space-y-3'>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Path Name</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.name || ''}
						onChange={(e) => onChange('name', e.target.value)}
						placeholder='e.g. Session 4 Journey'
					/>
				</div>

				<div className='space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground'>Line Styling</div>

					<SmartColorPicker label='Line Color' value={data.lineColor} onChange={(val) => onChange('lineColor', val)} />

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Opacity</label>
							<input
								type='range'
								min='0.1'
								max='1'
								step='0.1'
								className='w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer'
								value={data.opacity || 0.7}
								onChange={(e) => onChange('opacity', parseFloat(e.target.value))}
							/>
							<div className='text-right text-[10px] text-muted-foreground mt-1'>{data.opacity || 0.7}</div>
						</div>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Style</label>
							<select
								className={ADMIN_INPUT_CLASS}
								value={data.dashArray || ''}
								onChange={(e) => onChange('dashArray', e.target.value)}>
								<option value=''>Solid Line</option>
								<option value='10, 10'>Dashed (Large)</option>
								<option value='5, 5'>Dashed (Small)</option>
								<option value='1, 5'>Dotted</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- AREA FORM ---
export const AreaForm = ({ data, onChange, onDelete, onClose }) => {
	if (!data) return null;
	return (
		<div className='flex flex-col h-full w-full'>
			<Header title='Edit Region' onDelete={onDelete} onClose={onClose} />
			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='space-y-3'>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Region Name</label>
					<input
						className={ADMIN_INPUT_CLASS}
						value={data.name || ''}
						onChange={(e) => onChange('name', e.target.value)}
						placeholder='Region Label'
					/>
				</div>

				<div className='space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground'>Polygon Style</div>
					<SmartColorPicker
						label='Border Color'
						value={data.lineColor}
						onChange={(val) => onChange('lineColor', val)}
					/>
					<SmartColorPicker
						label='Fill Color'
						value={data.interiorColor}
						onChange={(val) => onChange('interiorColor', val)}
					/>

					{/* NEW: Polygon Opacity */}
					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Fill Opacity</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							className='w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer'
							value={data.fillOpacity ?? 0.2}
							onChange={(e) => onChange('fillOpacity', parseFloat(e.target.value))}
						/>
						<div className='text-right text-[10px] text-muted-foreground'>{data.fillOpacity ?? 0.2}</div>
					</div>
				</div>

				<div className='space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground'>Label Typography</div>

					<SmartColorPicker
						label='Text Color'
						value={data.labelColor || '#ffffff'}
						onChange={(val) => onChange('labelColor', val)}
					/>

					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Text Size (px)</label>
							<input
								type='number'
								className={ADMIN_INPUT_CLASS}
								value={data.fontSize || 16}
								onChange={(e) => onChange('fontSize', Number(e.target.value))}
							/>
						</div>
						<div>
							<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>Rotation (°)</label>
							<input
								type='number'
								className={ADMIN_INPUT_CLASS}
								value={data.textRotation || 0}
								onChange={(e) => onChange('textRotation', parseFloat(e.target.value))}
							/>
						</div>
					</div>
				</div>

				<div className='space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground'>Label Background</div>

					<SmartColorPicker
						label='Background Color'
						value={data.labelBgColor || '#000000'}
						onChange={(val) => onChange('labelBgColor', val)}
					/>

					<div>
						<label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>BG Opacity (0-1)</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.1'
							className='w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer'
							value={data.labelBgOpacity ?? 0}
							onChange={(e) => onChange('labelBgOpacity', parseFloat(e.target.value))}
						/>
						<div className='text-right text-[10px] text-muted-foreground'>{data.labelBgOpacity ?? 0}</div>
					</div>

					{data.labelPosition && (
						<div className='pt-2 border-t border-border/50'>
							<Button
								variant='secondary'
								size='sm'
								icon={RotateCcw}
								fullWidth
								onClick={() => onChange('labelPosition', null)}>
								Reset Position to Center
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
