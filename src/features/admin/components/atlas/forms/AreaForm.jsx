import React, { useState } from 'react';
import {
	Trash2,
	X,
	Hexagon,
	Square,
	CircleDashed,
	Type,
	Palette,
	Settings2,
	RotateCw,
	Eye,
	EyeOff,
} from 'lucide-react';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';
import clsx from 'clsx';

// --- UI HELPERS ---

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

const PropRow = ({ label, children, className }) => (
	<div className={clsx('flex items-center justify-between min-h-[32px] gap-3', className)}>
		<span className='text-[11px] font-medium text-muted-foreground shrink-0 w-20 truncate' title={label}>
			{label}
		</span>
		<div className='flex items-center gap-2 flex-1 justify-end min-w-0'>{children}</div>
	</div>
);

const ToggleGroup = ({ options, value, onChange }) => (
	<div className='flex bg-muted/50 p-0.5 rounded-md border border-border/50 shrink-0'>
		{options.map((opt) => (
			<button
				key={opt.value}
				onClick={() => onChange(opt.value)}
				className={clsx(
					'p-1 rounded-[3px] transition-all',
					value === opt.value ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-black/5',
				)}
				title={opt.label}>
				{opt.icon}
			</button>
		))}
	</div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
	<button
		onClick={onClick}
		className={clsx(
			'flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wide border-b-2 transition-colors',
			active ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted',
		)}>
		<Icon size={14} />
		{label}
	</button>
);

const safeHex = (c, fallback = '#d97706') => (/^#[0-9A-F]{6}$/i.test(c) ? c : fallback);

export default function AreaForm({ data, onChange, onDelete, onClose }) {
	if (!data) return null;
	const [tab, setTab] = useState('style'); // 'style' | 'text' | 'settings'

	const safeData = {
		name: '',
		lineColor: '#d97706',
		weight: 2,
		interiorColor: '#d97706',
		fillOpacity: 0.2,
		fillType: 'solid',
		borderStyle: 'solid',
		curviness: 0,
		fillSpacing: 10,
		fillWeight: 2,
		labelDisplay: 'always',
		labelColor: '#ffffff',
		fontSize: 16,
		textRotation: 0,
		labelBgColor: '#000000',
		labelBgOpacity: 0,
		labelRadius: 4,
		labelHasBorder: false,
		labelBorderColor: '#ffffff',
		paddingX: 8,
		paddingY: 4,
		visibleOnLoad: false, // Default
		...data,
	};

	const update = (field, val) => onChange(field, val);

	return (
		<div className='flex flex-col h-full bg-card/50 w-full'>
			<Header title='Region' onDelete={onDelete} onClose={onClose} />

			<div className='p-4 pb-0'>
				<input
					className='w-full bg-muted/30 border border-border rounded-md px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary placeholder:font-normal transition-all'
					value={safeData.name}
					onChange={(e) => update('name', e.target.value)}
					placeholder='Region Name...'
				/>
			</div>

			{/* NEW: VISIBILITY TOGGLE */}
			<div className='px-4 pt-4'>
				<div className='flex items-center justify-between bg-background border border-border rounded-md p-2'>
					<span className='text-xs font-bold text-muted-foreground uppercase'>Initial State</span>
					<button
						onClick={() => update('visibleOnLoad', !safeData.visibleOnLoad)}
						className={clsx(
							'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors border',
							safeData.visibleOnLoad
								? 'bg-green-500/10 text-green-600 border-green-500/20'
								: 'bg-muted text-muted-foreground border-transparent',
						)}>
						{safeData.visibleOnLoad ? <Eye size={12} /> : <EyeOff size={12} />}
						{safeData.visibleOnLoad ? 'Visible' : 'Hidden'}
					</button>
				</div>
			</div>

			<div className='flex border-b border-border mt-4 px-2'>
				<TabButton active={tab === 'style'} onClick={() => setTab('style')} icon={Palette} label='Style' />
				<TabButton active={tab === 'text'} onClick={() => setTab('text')} icon={Type} label='Text' />
				<TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings2} label='Misc' />
			</div>

			<div className='p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{tab === 'style' && (
					<div className='space-y-4 divide-y divide-border/40'>
						<div className='space-y-3'>
							<h4 className='text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider'>Fill</h4>
							<PropRow label='Color'>
								<SmartColorPicker
									value={safeHex(safeData.interiorColor)}
									onChange={(val) => update('interiorColor', val)}
								/>
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

							{(safeData.fillType === 'hatch' || safeData.fillType === 'dots') && (
								<>
									<PropRow label={safeData.fillType === 'hatch' ? 'Spacing' : 'Density'}>
										<input
											type='range'
											min='4'
											max='40'
											step='1'
											value={safeData.fillSpacing}
											onChange={(e) => update('fillSpacing', parseInt(e.target.value))}
											className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
										/>
										<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
											{safeData.fillSpacing}
										</span>
									</PropRow>
									<PropRow label={safeData.fillType === 'hatch' ? 'Thickness' : 'Dot Size'}>
										<input
											type='range'
											min='1'
											max='10'
											step='0.5'
											value={safeData.fillWeight}
											onChange={(e) => update('fillWeight', parseFloat(e.target.value))}
											className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
										/>
										<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
											{safeData.fillWeight}
										</span>
									</PropRow>
								</>
							)}

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

						<div className='pt-4 space-y-3'>
							<h4 className='text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider'>Border</h4>
							<PropRow label='Style'>
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
									<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
										{safeData.weight}px
									</span>
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
					</div>
				)}

				{tab === 'text' && (
					<div className='space-y-4 divide-y divide-border/40'>
						<div className='space-y-3'>
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
							<PropRow label='Size'>
								<input
									type='range'
									min='8'
									max='64'
									step='1'
									value={safeData.fontSize}
									onChange={(e) => update('fontSize', parseInt(e.target.value))}
									className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
								<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>{safeData.fontSize}</span>
							</PropRow>
							<PropRow label='Rotation'>
								<div className='flex items-center gap-2 flex-1'>
									<RotateCw size={12} className='text-muted-foreground' />
									<input
										type='range'
										min='0'
										max='360'
										step='5'
										value={safeData.textRotation}
										onChange={(e) => update('textRotation', parseInt(e.target.value))}
										className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
									/>
									<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
										{safeData.textRotation}°
									</span>
								</div>
							</PropRow>
							<PropRow label='Color'>
								<SmartColorPicker
									value={safeHex(safeData.labelColor, '#ffffff')}
									onChange={(val) => update('labelColor', val)}
								/>
							</PropRow>
							<div className='pb-4'>
								<PropRow label='Padding'>
									<div className='flex gap-2 w-full flex-wrap'>
										<div className='flex-1 flex items-center gap-1'>
											<span className='text-[9px] text-muted-foreground uppercase'>H</span>
											<input
												type='range'
												min='0'
												max='32'
												step='1'
												value={safeData.paddingX}
												onChange={(e) => update('paddingX', parseInt(e.target.value))}
												className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
											/>
										</div>
										<div className='flex-1 flex items-center gap-1'>
											<span className='text-[9px] text-muted-foreground uppercase'>V</span>
											<input
												type='range'
												min='0'
												max='32'
												step='1'
												value={safeData.paddingY}
												onChange={(e) => update('paddingY', parseInt(e.target.value))}
												className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
											/>
										</div>
									</div>
								</PropRow>
							</div>
						</div>

						<div className='pt-4 space-y-3'>
							<h4 className='text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider'>
								Background & Border
							</h4>
							<PropRow label='Bg Color'>
								<SmartColorPicker
									value={safeHex(safeData.labelBgColor, '#000000')}
									onChange={(val) => update('labelBgColor', val)}
								/>
							</PropRow>
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
							<PropRow label='Radius'>
								<input
									type='range'
									min='0'
									max='20'
									step='1'
									value={safeData.labelRadius}
									onChange={(e) => update('labelRadius', parseInt(e.target.value))}
									className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
								<span className='text-[10px] font-mono text-muted-foreground w-8 text-right'>
									{safeData.labelRadius}
								</span>
							</PropRow>
							<PropRow label='Show Border'>
								<div className='flex items-center gap-2 justify-end w-full'>
									{safeData.labelHasBorder && (
										<SmartColorPicker
											value={safeHex(safeData.labelBorderColor, safeData.labelColor)}
											onChange={(val) => update('labelBorderColor', val)}
										/>
									)}
									<button
										onClick={() => update('labelHasBorder', !safeData.labelHasBorder)}
										className={clsx(
											'w-8 h-4 rounded-full transition-colors relative border',
											safeData.labelHasBorder ? 'bg-primary border-primary' : 'bg-muted border-border',
										)}>
										<div
											className={clsx(
												'absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all shadow-sm',
												safeData.labelHasBorder ? 'right-0.5' : 'left-0.5',
											)}
										/>
									</button>
								</div>
							</PropRow>
						</div>
					</div>
				)}

				{tab === 'settings' && (
					<div className='space-y-4'>
						<div className='p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-600'>
							<strong>Tip:</strong> Drag the center point of the region to move the text label manually.
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
