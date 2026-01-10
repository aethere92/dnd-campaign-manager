import React, { useState } from 'react';
import { ENTITY_COLORS } from '@/domain/entity/config/entityColors';
import { Check, ChevronDown, Pipette } from 'lucide-react';
import { clsx } from 'clsx';

const PRESETS = [
	{ label: 'Amber', value: '#d97706' },
	{ label: 'Red', value: '#dc2626' },
	{ label: 'Emerald', value: '#059669' },
	{ label: 'Blue', value: '#2563eb' },
	{ label: 'Purple', value: '#7c3aed' },
	{ label: 'Cyan', value: '#0891b2' },
	{ label: 'Slate', value: '#475569' },
	{ label: 'Black', value: '#1a1a1a' },
	{ label: 'White', value: '#ffffff' },
];

export default function SmartColorPicker({ label, value, onChange }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='relative'>
			{label && <label className='text-[10px] font-bold uppercase text-muted-foreground mb-1 block'>{label}</label>}

			<div className='flex gap-2'>
				<button
					type='button'
					onClick={() => setIsOpen(!isOpen)}
					className='flex-1 flex items-center gap-2 h-9 px-3 bg-background border border-border rounded-md hover:bg-muted/50 transition-colors'>
					<div
						className='w-4 h-4 rounded-full border border-black/10 shadow-sm'
						style={{ backgroundColor: value || '#000' }}
					/>
					<span className='text-xs font-mono flex-1 text-left'>{value || 'Select...'}</span>
					<ChevronDown size={14} className='opacity-50' />
				</button>

				{/* Native Picker Fallback/Override */}
				<div className='relative w-9 h-9'>
					<input
						type='color'
						value={value || '#000000'}
						onChange={(e) => onChange(e.target.value)}
						className='absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10'
					/>
					<div className='w-full h-full bg-background border border-border rounded-md flex items-center justify-center text-muted-foreground'>
						<Pipette size={14} />
					</div>
				</div>
			</div>

			{/* Popover */}
			{isOpen && (
				<>
					<div className='fixed inset-0 z-[1002]' onClick={() => setIsOpen(false)} />
					<div className='absolute top-full left-0 mt-2 w-56 bg-card border border-border shadow-xl rounded-lg p-3 z-[1003] grid grid-cols-4 gap-2'>
						{PRESETS.map((preset) => (
							<button
								key={preset.value}
								type='button'
								onClick={() => {
									onChange(preset.value);
									setIsOpen(false);
								}}
								className={clsx(
									'w-8 h-8 rounded-full border border-black/10 shadow-sm relative transition-transform hover:scale-110',
									value === preset.value && 'ring-2 ring-offset-2 ring-primary'
								)}
								style={{ backgroundColor: preset.value }}
								title={preset.label}>
								{value === preset.value && (
									<div className='absolute inset-0 flex items-center justify-center'>
										<Check
											size={12}
											className={['#ffffff', '#f1f5f9'].includes(preset.value) ? 'text-black' : 'text-white'}
										/>
									</div>
								)}
							</button>
						))}

						{/* Entity Type Colors */}
						<div className='col-span-4 mt-2 pt-2 border-t border-border'>
							<span className='text-[9px] font-bold uppercase text-muted-foreground block mb-2'>Entity Types</span>
							<div className='grid grid-cols-4 gap-2'>
								{Object.entries(ENTITY_COLORS).map(([key, col]) => (
									<button
										key={key}
										type='button'
										onClick={() => {
											onChange(col);
											setIsOpen(false);
										}}
										className={clsx(
											'w-8 h-8 rounded-md border border-black/10 shadow-sm relative transition-transform hover:scale-110',
											value === col && 'ring-2 ring-offset-2 ring-primary'
										)}
										style={{ backgroundColor: col }}
										title={key}
									/>
								))}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
