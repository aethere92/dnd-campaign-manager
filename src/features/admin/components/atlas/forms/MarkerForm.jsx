import React, { useState, useEffect } from 'react';
import { Trash2, X, MapPin, Circle, Image as ImageIcon, Type, Minus, Plus, Tag, Palette, RotateCw } from 'lucide-react';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';
import ShapeSelector from '../components/ShapeSelector';
import VisualIconPicker from '../components/VisualIconPicker';
import TileSelector from '../components/TileSelector';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { fetchCampaignMaps } from '@/features/atlas/api/mapService';
import clsx from 'clsx';

const LABEL_CLASS = 'text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block tracking-wide';
const SECTION_CLASS = 'space-y-4 p-4 rounded-xl border border-border bg-card/50';

const Header = ({ title, onDelete, onClose }) => (
	<div className='flex justify-between items-center px-5 py-4 border-b border-border bg-background shrink-0 sticky top-0 z-10'>
		<span className='font-bold text-sm uppercase flex items-center gap-2'>{title}</span>
		<div className='flex gap-1'>
			{onDelete && (
				<button
					onClick={onDelete}
					className='w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors'>
					<Trash2 size={16} />
				</button>
			)}
			<button
				onClick={onClose}
				className='w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md transition-colors'>
				<X size={16} />
			</button>
		</div>
	</div>
);

export default function MarkerForm({ data, onChange, onDelete, onClose }) {
	const { campaignId } = useCampaign();
	const [mapOptions, setMapOptions] = useState([]);

	useEffect(() => {
		if (campaignId) fetchCampaignMaps(campaignId).then(setMapOptions);
	}, [campaignId]);

	const safeData = {
		label: '',
		color: '#d97706',
		variant: 'large',
		shape: 'pin',
		icon: 'MapPin',
		category: 'default',
		labelDisplay: 'hover',
		scale: 1,
		mapLink: '',
		// Text Specifics
		labelBgColor: '#000000',
		labelBgOpacity: 0,
		labelRadius: 4,
		labelHasBorder: false,
		labelBorderColor: '#ffffff',
		textRotation: 0,
		paddingX: 8,
		paddingY: 4,
		...data,
	};

	return (
		<div className='flex flex-col h-full bg-muted/10 w-full'>
			<Header title='Edit Marker' onDelete={onDelete} onClose={onClose} />

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{/* NAME & CATEGORY */}
				<div className={SECTION_CLASS}>
					<div className='flex gap-3'>
						<div className='w-12 h-12 rounded-lg shrink-0 flex items-center justify-center border border-border bg-card shadow-sm'>
							<div
								className='w-6 h-6 flex items-center justify-center font-bold text-xs'
								style={{ color: safeData.color }}>
								{safeData.variant === 'text' ? (
									'T'
								) : (
									<div className='w-4 h-4 rounded-full' style={{ backgroundColor: safeData.color }} />
								)}
							</div>
						</div>
						<div className='flex-1 space-y-2'>
							<input
								className='w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary'
								value={safeData.label}
								onChange={(e) => onChange('label', e.target.value)}
								placeholder='Marker Name...'
							/>
							<div className='flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg'>
								<Tag size={12} className='text-muted-foreground' />
								<select
									className='bg-transparent text-xs w-full focus:outline-none text-muted-foreground font-medium'
									value={safeData.category}
									onChange={(e) => onChange('category', e.target.value)}>
									<option value='default'>Default</option>
									<option value='locations'>Locations</option>
									<option value='cities'>Cities</option>
									<option value='npcs'>NPCs</option>
									<option value='shops'>Shops</option>
									<option value='pois'>Points of Interest</option>
									<option value='quests'>Quests</option>
									<option value='encounters'>Encounters</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-2'>
					<label className={LABEL_CLASS}>Appearance</label>
					<TileSelector
						value={safeData.variant}
						onChange={(v) => onChange('variant', v)}
						options={[
							{ value: 'large', label: 'Large', icon: MapPin },
							{ value: 'small', label: 'Small', icon: Circle },
							{ value: 'icon', label: 'Icon', icon: ImageIcon },
							{ value: 'text', label: 'Text', icon: Type },
						]}
					/>
				</div>

				{/* VISUAL SETTINGS */}

				{/* 1. SHAPE VARIANTS */}
				{['large', 'small'].includes(safeData.variant) && (
					<div className='space-y-4 bg-card p-4 rounded-xl border border-border'>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Shape</label>
							<ShapeSelector value={safeData.shape} onChange={(v) => onChange('shape', v)} color={safeData.color} />
						</div>
						<div className='h-px bg-border/50' />
						<div className='grid grid-cols-1 gap-4'>
							<div className='space-y-2'>
								<label className={LABEL_CLASS}>Color</label>
								<SmartColorPicker value={safeData.color} onChange={(v) => onChange('color', v)} />
							</div>
							{safeData.variant === 'large' && (
								<div className='space-y-2'>
									<label className={LABEL_CLASS}>Icon</label>
									<VisualIconPicker value={safeData.icon} onChange={(v) => onChange('icon', v)} />
								</div>
							)}
						</div>
					</div>
				)}

				{/* 2. ICON VARIANT */}
				{safeData.variant === 'icon' && (
					<div className='space-y-4 bg-card p-4 rounded-xl border border-border'>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Select Icon</label>
							<VisualIconPicker value={safeData.icon} onChange={(v) => onChange('icon', v)} />
						</div>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Tint Color</label>
							<SmartColorPicker value={safeData.color} onChange={(v) => onChange('color', v)} />
						</div>
					</div>
				)}

				{/* 3. TEXT VARIANT (RICH) */}
				{safeData.variant === 'text' && (
					<div className='space-y-4 bg-card p-4 rounded-xl border border-border'>
						<div className='space-y-2'>
							<div className='flex items-center gap-2 mb-2'>
								<Palette size={14} className='text-muted-foreground' />
								<label className={LABEL_CLASS} style={{ marginBottom: 0 }}>
									Text Color
								</label>
							</div>
							<SmartColorPicker value={safeData.color} onChange={(v) => onChange('color', v)} />
						</div>

						<div className='h-px bg-border/50' />

						{/* NEW: Padding Controls */}
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<span className='text-[10px] font-medium text-muted-foreground'>Padding</span>
							</div>
							<div className='flex gap-4 w-full flex-wrap'>
								<div className='flex-1 flex items-center gap-2'>
									<span className='text-[9px] text-muted-foreground font-bold'>HORZ</span>
									<input
										type='range'
										min='0'
										max='32'
										step='1'
										value={safeData.paddingX}
										onChange={(e) => onChange('paddingX', parseInt(e.target.value))}
										className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
									/>
								</div>
								<div className='flex-1 flex items-center gap-2'>
									<span className='text-[9px] text-muted-foreground font-bold'>VERT</span>
									<input
										type='range'
										min='0'
										max='32'
										step='1'
										value={safeData.paddingY}
										onChange={(e) => onChange('paddingY', parseInt(e.target.value))}
										className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
									/>
								</div>
							</div>
						</div>

						<div className='space-y-3'>
							<div className='flex justify-between items-center'>
								<span className='text-[10px] font-medium text-muted-foreground'>Background</span>
								<SmartColorPicker
									value={safeData.labelBgColor || '#000000'}
									onChange={(v) => onChange('labelBgColor', v)}
								/>
							</div>
							<div className='flex items-center gap-3'>
								<span className='text-[10px] font-medium text-muted-foreground w-12'>Opacity</span>
								<input
									type='range'
									min='0'
									max='1'
									step='0.1'
									value={safeData.labelBgOpacity ?? 0}
									onChange={(e) => onChange('labelBgOpacity', parseFloat(e.target.value))}
									className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
							</div>
						</div>

						<div className='h-px bg-border/50' />

						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span className='text-[10px] font-medium text-muted-foreground'>Border</span>
								<div className='flex items-center gap-2'>
									{safeData.labelHasBorder && (
										<SmartColorPicker
											value={safeData.labelBorderColor || safeData.color}
											onChange={(v) => onChange('labelBorderColor', v)}
										/>
									)}
									<button
										onClick={() => onChange('labelHasBorder', !safeData.labelHasBorder)}
										className={clsx(
											'w-8 h-4 rounded-full transition-colors relative border',
											safeData.labelHasBorder ? 'bg-primary border-primary' : 'bg-muted border-border'
										)}>
										<div
											className={clsx(
												'absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all shadow-sm',
												safeData.labelHasBorder ? 'right-0.5' : 'left-0.5'
											)}
										/>
									</button>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<span className='text-[10px] font-medium text-muted-foreground w-12'>Radius</span>
								<input
									type='range'
									min='0'
									max='20'
									step='1'
									value={safeData.labelRadius ?? 4}
									onChange={(e) => onChange('labelRadius', parseInt(e.target.value))}
									className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
							</div>
						</div>

						<div className='h-px bg-border/50' />

						<div className='flex items-center gap-3'>
							<RotateCw size={14} className='text-muted-foreground' />
							<input
								type='range'
								min='0'
								max='360'
								step='5'
								value={safeData.textRotation ?? 0}
								onChange={(e) => onChange('textRotation', parseInt(e.target.value))}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
							<span className='text-[10px] font-mono text-muted-foreground'>{safeData.textRotation}°</span>
						</div>
					</div>
				)}

				{/* SCALING & LINKING */}
				<div className={SECTION_CLASS}>
					<div className='space-y-2'>
						<div className='flex justify-between'>
							<label className={LABEL_CLASS}>Size / Scale</label>
							<span className='text-[10px] font-mono text-muted-foreground'>{safeData.scale.toFixed(1)}x</span>
						</div>
						<div className='flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border'>
							<button
								onClick={() => onChange('scale', Math.max(0.5, safeData.scale - 0.1))}
								className='p-1 hover:text-primary'>
								<Minus size={14} />
							</button>
							<input
								type='range'
								min='0.5'
								max='2.0'
								step='0.1'
								value={safeData.scale}
								onChange={(e) => onChange('scale', parseFloat(e.target.value))}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
							<button
								onClick={() => onChange('scale', Math.min(2.0, safeData.scale + 0.1))}
								className='p-1 hover:text-primary'>
								<Plus size={14} />
							</button>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4 pt-2'>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Label Display</label>
							<select
								className={ADMIN_INPUT_CLASS}
								value={safeData.labelDisplay}
								onChange={(e) => onChange('labelDisplay', e.target.value)}>
								<option value='always'>Always Visible</option>
								<option value='hover'>On Hover</option>
								<option value='none'>Hidden</option>
							</select>
						</div>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Link Map</label>
							<select
								className={ADMIN_INPUT_CLASS}
								value={safeData.mapLink || ''}
								onChange={(e) => onChange('mapLink', e.target.value)}>
								<option value=''>-- None --</option>
								{mapOptions.map((m) => (
									<option key={m.key} value={m.key}>
										{m.title}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
