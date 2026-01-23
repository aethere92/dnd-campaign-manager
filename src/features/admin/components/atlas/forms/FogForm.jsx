import React from 'react';
import { CloudFog, X, Trash2, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';

export const FogForm = ({ config, actions, onClose }) => {
	if (!config) return null;

	return (
		<div className='flex flex-col h-full bg-card shadow-2xl z-[1001] w-full border-l border-border rounded-lg'>
			{/* HEADER */}
			<div className='flex justify-between items-center p-4 border-b border-border bg-muted/40 shrink-0'>
				<span className='font-bold text-sm uppercase flex items-center gap-2'>
					<CloudFog size={16} /> Fog of War
				</span>
				<div className='flex gap-1'>
					{/* NEW: Finish Button to deselect/close shape */}
					<button
						onClick={() => actions.setTool('select')} // Deselects and stops drawing
						className='flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 rounded text-[10px] font-bold uppercase transition-colors mr-2'
						title='Finish drawing current shape'>
						<CheckCircle2 size={12} /> Finish
					</button>
					<button onClick={onClose} className='p-1.5 hover:bg-muted rounded text-muted-foreground'>
						<X size={16} />
					</button>
				</div>
			</div>

			<div className='p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1'>
				{/* ENABLE TOGGLE */}
				<div className='flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border'>
					<span className='text-xs font-bold text-muted-foreground uppercase'>Fog Layer</span>
					<button
						onClick={() => actions.updateFogConfig({ enabled: !config.enabled })}
						className={`px-3 py-1 rounded text-xs font-bold transition-colors border ${
							config.enabled
								? 'bg-green-500/10 text-green-600 border-green-500/20'
								: 'bg-muted text-muted-foreground border-transparent'
						}`}>
						{config.enabled ? 'Enabled' : 'Disabled'}
					</button>
				</div>

				{/* MODE SELECTOR */}
				<div className='space-y-2'>
					<label className='text-[10px] font-bold uppercase text-muted-foreground'>Drawing Mode</label>
					<div className='flex bg-muted/50 p-1 rounded-lg border border-border'>
						<button
							onClick={() => actions.updateFogConfig({ invert: false })}
							className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
								!config.invert ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
							}`}>
							Reveal Areas
						</button>
						<button
							onClick={() => actions.updateFogConfig({ invert: true })}
							className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
								config.invert ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
							}`}>
							Hide Areas
						</button>
					</div>
				</div>

				<div className='h-px bg-border/50 w-full' />

				{/* APPEARANCE */}
				<div className='space-y-4'>
					<h4 className='text-[10px] font-bold uppercase text-muted-foreground'>Appearance</h4>

					<div className='space-y-2'>
						<label className='text-xs font-medium text-muted-foreground'>Color</label>
						<SmartColorPicker value={config.color} onChange={(c) => actions.updateFogConfig({ color: c })} />
					</div>

					<div className='space-y-2'>
						<label className='text-xs font-medium text-muted-foreground'>Opacity</label>
						<div className='flex items-center gap-3'>
							<input
								type='range'
								min='0'
								max='1'
								step='0.01'
								value={config.opacity}
								onChange={(e) => actions.updateFogConfig({ opacity: parseFloat(e.target.value) })}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
							<span className='text-xs font-mono w-8 text-right'>{Math.round(config.opacity * 100)}%</span>
						</div>
					</div>

					{/* FIX: Updated Range for Blur */}
					<div className='space-y-2'>
						<div className='flex justify-between'>
							<label className='text-xs font-medium text-muted-foreground'>Edge Softness</label>
							<span className='text-[10px] text-muted-foreground italic'>(Map Units: {config.edgeSoftness})</span>
						</div>
						<div className='flex items-center gap-3'>
							<input
								type='range'
								min='0'
								max='5'
								step='0.05'
								value={config.edgeSoftness}
								onChange={(e) => actions.updateFogConfig({ edgeSoftness: parseFloat(e.target.value) })}
								className='flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
							/>
						</div>
						<p className='text-[10px] text-muted-foreground opacity-70'>
							Adjusts the blur radius relative to map coordinates. Lower values are sharper.
						</p>
					</div>
				</div>

				<div className='h-px bg-border/50 w-full' />

				{/* SHAPES LIST */}
				<div className='space-y-2'>
					<div className='flex justify-between items-center'>
						<h4 className='text-[10px] font-bold uppercase text-muted-foreground'>Shapes ({config.shapes.length})</h4>
						{config.shapes.length > 0 && (
							<button
								onClick={() => {
									if (confirm('Clear all fog shapes?')) {
										config.shapes.forEach((s) => actions.deleteFogShape(s.id));
									}
								}}
								className='text-[10px] text-red-500 hover:underline'>
								Clear All
							</button>
						)}
					</div>

					<div className='max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
						{config.shapes.length === 0 && (
							<div className='text-xs text-muted-foreground italic p-2 text-center border border-dashed border-border rounded'>
								Click map to draw shapes.
								<br />
								Click the start point to close loop.
							</div>
						)}
						{config.shapes.map((shape, idx) => (
							<div
								key={shape.id}
								className='flex items-center justify-between p-2 rounded bg-muted/20 border border-border/50 text-xs group hover:bg-muted/50 transition-colors'>
								<span className='font-mono text-muted-foreground'>
									Shape #{idx + 1} <span className='opacity-50'>({shape.points.length} pts)</span>
								</span>
								<div className='flex gap-2'>
									<button
										onClick={() => actions.selectItem('fog', shape.id)}
										className='text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100'
										title='Edit Shape'>
										Edit
									</button>
									<button
										onClick={() => actions.deleteFogShape(shape.id)}
										className='text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'>
										<Trash2 size={12} />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
