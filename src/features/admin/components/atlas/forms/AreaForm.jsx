import React, { useState } from 'react';
import {
	Trash2,
	X,
	Hexagon,
	Maximize2,
	Type,
	Layout,
	Square,
	CircleDashed,
	MoreHorizontal,
	AlignLeft,
	Eye,
	EyeOff,
} from 'lucide-react';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';
import clsx from 'clsx';

// --- UI COMPONENTS ---

const Header = ({ title, onDelete, onClose }) => (
	<div className='flex justify-between items-center px-4 py-3 border-b border-border bg-background shrink-0 sticky top-0 z-10'>
		<span className='font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-muted-foreground'>
			<Hexagon size={14} />
			{title}
		</span>
		<div className='flex gap-1'>
			{onDelete && (
				<button
					onClick={onDelete}
					className='p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors'>
					<Trash2 size={14} />
				</button>
			)}
			<button onClick={onClose} className='p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors'>
				<X size={14} />
			</button>
		</div>
	</div>
);

// A clean row for property controls
const PropRow = ({ label, children, className }) => (
	<div className={clsx('flex items-center justify-between min-h-[32px] gap-3', className)}>
		<span className='text-[11px] font-medium text-muted-foreground shrink-0 w-20 truncate' title={label}>
			{label}
		</span>
		<div className='flex items-center gap-2 flex-1 justify-end min-w-0'>{children}</div>
	</div>
);

// A compact button group for toggles
const ToggleGroup = ({ options, value, onChange }) => (
	<div className='flex bg-muted/50 p-0.5 rounded-md border border-border/50 shrink-0'>
		{options.map((opt) => (
			<button
				key={opt.value}
				onClick={() => onChange(opt.value)}
				className={clsx(
					'p-1 rounded-[3px] transition-all',
					value === opt.value ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-black/5'
				)}
				title={opt.label}>
				{opt.icon}
			</button>
		))}
	</div>
);

const toHex = (c) => (/^#[0-9A-F]{6}$/i.test(c) ? c : '#d97706');
const safeHex = (c, fallback = '#d97706') => (/^#[0-9A-F]{6}$/i.test(c) ? c : fallback);

export default function AreaForm({ data, onChange, onDelete, onClose }) {
	if (!data) return null;

	const safeData = {
		name: '',
		lineColor: '#d97706',
		weight: 2, // Default stroke width
		interiorColor: '#d97706',
		fillOpacity: 0.2,
		fillType: 'solid',
		borderStyle: 'solid',
		curviness: 0,
		labelDisplay: 'always',
		labelColor: '#ffffff',
		fontSize: 16,
		textRotation: 0,
		labelBgColor: '#000000',
		labelBgOpacity: 0,
		...data,
	};

	const update = (field, val) => onChange(field, val);

	return (
		<div className='flex flex-col h-full bg-card/50 w-full'>
			<Header title='Region' onDelete={onDelete} onClose={onClose} />

			<div className='p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{/* 1. Name Input */}
				<div>
					<input
						className='w-full bg-muted/30 border border-border rounded-md px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary placeholder:font-normal transition-all'
						value={safeData.name}
						onChange={(e) => update('name', e.target.value)}
						placeholder='Region Name...'
						autoFocus
					/>
				</div>

				<div className='space-y-4 divide-y divide-border/40'>
					{/* 2. FILL SECTION */}
					<div className='pt-2 space-y-3'>
						<h4 className='text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider'>Appearance</h4>

						<PropRow label='Fill'>
							{/* Color */}
							<SmartColorPicker
								value={safeHex(safeData.interiorColor)}
								onChange={(val) => update('interiorColor', val)}
							/>
							{/* Pattern Type */}
							<ToggleGroup
								value={safeData.fillType}
								onChange={(v) => update('fillType', v)}
								options={[
									{ value: 'solid', icon: <Square size={14} fill='currentColor' />, label: 'Solid' },
									{
										value: 'hatch',
										icon: (
											<div className='w-3.5 h-3.5 bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_50%,currentColor_50%,currentColor_75%,transparent_75%,transparent)] bg-[length:4px_4px]' />
										),
										label: 'Hatch',
									},
									{ value: 'dots', icon: <CircleDashed size={14} />, label: 'Dots' },
								]}
							/>
						</PropRow>

						<PropRow label='Opacity'>
							<input
								type='range'
								min='0'
								max='1'
								step='0.05'
								value={safeData.fillOpacity}
								onChange={(e) => update('fillOpacity', parseFloat(e.target.value))}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
							<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
								{Math.round(safeData.fillOpacity * 100)}%
							</span>
						</PropRow>
					</div>

					{/* 3. STROKE SECTION */}
					<div className='pt-4 space-y-3'>
						<PropRow label='Stroke'>
							<SmartColorPicker value={safeHex(safeData.lineColor)} onChange={(val) => update('lineColor', val)} />
							<ToggleGroup
								value={safeData.borderStyle}
								onChange={(v) => update('borderStyle', v)}
								options={[
									{ value: 'solid', icon: <div className='w-3 h-0.5 bg-current' />, label: 'Solid' },
									{
										value: 'dashed',
										icon: <div className='w-3 h-0.5 border-t border-dashed border-current' />,
										label: 'Dashed',
									},
									{ value: 'none', icon: <X size={14} />, label: 'None' },
								]}
							/>
						</PropRow>

						{safeData.borderStyle !== 'none' && (
							<PropRow label='Width'>
								<input
									type='range'
									min='1'
									max='20'
									step='1'
									value={safeData.weight || 2}
									onChange={(e) => update('weight', parseInt(e.target.value))}
									className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
								<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>{safeData.weight}px</span>
							</PropRow>
						)}

						<PropRow label='Rounding'>
							<input
								type='range'
								min='0'
								max='1'
								step='0.1'
								value={safeData.curviness}
								onChange={(e) => update('curviness', parseFloat(e.target.value))}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
						</PropRow>
					</div>

					{/* 4. LABEL SECTION */}
					<div className='pt-4 space-y-3'>
						<h4 className='text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider'>Label</h4>

						<PropRow label='Visibility'>
							<select
								className='bg-muted/30 border border-border rounded text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary w-full'
								value={safeData.labelDisplay}
								onChange={(e) => update('labelDisplay', e.target.value)}>
								<option value='always'>Always Show</option>
								<option value='hover'>Show on Hover</option>
								<option value='none'>Hidden</option>
							</select>
						</PropRow>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-1'>
								<label className='text-[10px] text-muted-foreground'>Text</label>
								<SmartColorPicker
									value={safeHex(safeData.labelColor, '#ffffff')}
									onChange={(val) => update('labelColor', val)}
								/>
							</div>
							<div className='space-y-1'>
								<label className='text-[10px] text-muted-foreground'>Background</label>
								<SmartColorPicker
									value={safeHex(safeData.labelBgColor, '#000000')}
									onChange={(val) => update('labelBgColor', val)}
								/>
							</div>
						</div>

						<PropRow label='Bg Opacity'>
							<input
								type='range'
								min='0'
								max='1'
								step='0.1'
								value={safeData.labelBgOpacity}
								onChange={(e) => update('labelBgOpacity', parseFloat(e.target.value))}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
							<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
								{Math.round(safeData.labelBgOpacity * 100)}%
							</span>
						</PropRow>

						<PropRow label='Size'>
							<input
								type='number'
								className='bg-muted/30 border border-border rounded text-xs w-16 px-1 py-0.5 text-right'
								value={safeData.fontSize}
								onChange={(e) => update('fontSize', Number(e.target.value))}
							/>
							<span className='text-[10px] text-muted-foreground'>px</span>
						</PropRow>
					</div>
				</div>
			</div>
		</div>
	);
}
