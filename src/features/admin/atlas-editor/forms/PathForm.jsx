// --- FILE: forms/PathForm.jsx ---
import { Trash2, X, Footprints, LayoutTemplate, Type as TypeIcon, AlignCenter, EyeOff, Eye } from 'lucide-react'; // Added AlignCenter
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';
import SmartColorPicker from '@/features/admin/components/SmartColorPicker';

const LABEL_CLASS = 'text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block tracking-wide';
const SECTION_CLASS = 'space-y-4 p-4 rounded-xl border border-border bg-card/50';

const Header = ({ title, onDelete, onClose }) => (
	<div className='flex justify-between items-center px-5 py-4 border-b border-border bg-background shrink-0 sticky top-0 z-10'>
		<span className='font-bold text-sm uppercase flex items-center gap-2'>{title}</span>
		<div className='flex gap-1'>
			{onDelete && (
				<button
					onClick={onDelete}
					className='w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors'
					title='Delete'>
					<Trash2 size={16} />
				</button>
			)}
			<button
				onClick={onClose}
				className='w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md transition-colors'
				title='Close'>
				<X size={16} />
			</button>
		</div>
	</div>
);

export default function PathForm({ data, onChange, onDelete, onClose }) {
	if (!data) return null;

	const safeData = {
		name: '',
		color: '#d97706',
		opacity: 1,
		weight: 5,
		dashArray: '',
		curviness: 0,
		labelDisplay: 'hover',
		labelStyle: 'box',
		textAlongLine: false, // NEW DEFAULT
		...data,
	};

	return (
		<div className='flex flex-col h-full bg-muted/10 w-full'>
			<Header title='Edit Path' onDelete={onDelete} onClose={onClose} />
			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				{/* NEW VISIBILITY TOGGLE */}
				<div className='space-y-4 p-4 rounded-xl border border-border bg-card/50'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-bold text-muted-foreground uppercase'>Initial State</span>
						<button
							onClick={() => onChange('visibleOnLoad', !safeData.visibleOnLoad)}
							className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors border ${
								safeData.visibleOnLoad
									? 'bg-green-500/10 text-green-600 border-green-500/20'
									: 'bg-muted text-muted-foreground border-transparent'
							}`}>
							{safeData.visibleOnLoad ? <Eye size={12} /> : <EyeOff size={12} />}
							{safeData.visibleOnLoad ? 'Visible on Load' : 'Hidden on Load'}
						</button>
					</div>
				</div>
				<div className={SECTION_CLASS}>
					<div className='flex gap-3'>
						<div className='w-12 h-12 rounded-lg shrink-0 flex items-center justify-center border border-border bg-card shadow-sm'>
							<div className='w-8 h-8 flex items-center justify-center relative'>
								<svg viewBox='0 0 24 24' className='w-6 h-6 overflow-visible'>
									<path
										d={safeData.curviness > 0 ? 'M2,20 Q12,4 22,20' : 'M2,20 L12,4 L22,20'}
										fill='none'
										stroke={safeData.color}
										strokeWidth={safeData.weight > 5 ? 3 : 1.5}
										strokeDasharray={safeData.dashArray ? '4,2' : 'none'}
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</div>
						</div>
						<div className='flex-1 space-y-2'>
							<input
								className='w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary placeholder:font-normal'
								value={safeData.name}
								onChange={(e) => onChange('name', e.target.value)}
								placeholder='Path Name...'
								autoFocus
							/>
							<div className='flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground'>
								<Footprints size={12} />
								<span>Path Object</span>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-4'>
					<label className={LABEL_CLASS}>Line Style</label>
					{/* ... (Existing Line Style Buttons kept same) ... */}
					<div className='grid grid-cols-3 gap-2'>
						{[
							{
								label: 'Solid',
								value: '',
								svg: <line x1='4' y1='12' x2='20' y2='12' stroke='currentColor' strokeWidth='2' />,
							},
							{
								label: 'Dashed',
								value: '20, 15',
								svg: (
									<line x1='4' y1='12' x2='20' y2='12' stroke='currentColor' strokeWidth='2' strokeDasharray='4,3' />
								),
							},
							{
								label: 'Dotted',
								value: '1, 10',
								svg: (
									<line
										x1='4'
										y1='12'
										x2='20'
										y2='12'
										stroke='currentColor'
										strokeWidth='3'
										strokeDasharray='1,6'
										strokeLinecap='round'
									/>
								),
							},
						].map((opt) => (
							<button
								key={opt.label}
								onClick={() => onChange('dashArray', opt.value)}
								className={`flex flex-col items-center justify-center gap-1 h-14 rounded-lg border transition-all ${
									safeData.dashArray === opt.value
										? 'bg-primary/10 border-primary text-primary'
										: 'bg-card border-border hover:bg-muted text-muted-foreground'
								}`}>
								<svg width='24' height='24' viewBox='0 0 24 24'>
									{opt.svg}
								</svg>
								<span className='text-[9px] uppercase font-bold'>{opt.label}</span>
							</button>
						))}
					</div>

					<div className={SECTION_CLASS}>
						<div className='space-y-4'>
							<div className='space-y-2'>
								<label className={LABEL_CLASS}>Stroke Color</label>
								<SmartColorPicker value={safeData.color} onChange={(val) => onChange('color', val)} />
							</div>
							{/* ... Thickness and Curviness controls kept same ... */}
							<div className='space-y-2'>
								<div className='flex justify-between'>
									<label className={LABEL_CLASS}>Thickness</label>
									<span className='text-[10px] font-mono text-muted-foreground'>{safeData.weight}px</span>
								</div>
								<input
									type='range'
									min='1'
									max='20'
									step='1'
									value={safeData.weight}
									onChange={(e) => onChange('weight', parseInt(e.target.value))}
									className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
							</div>
							<div className='space-y-2'>
								<div className='flex justify-between'>
									<label className={LABEL_CLASS}>Curviness</label>
									<span className='text-[10px] font-mono text-muted-foreground'>
										{safeData.curviness === 0 ? 'Straight' : 'Curved'}
									</span>
								</div>
								<input
									type='range'
									min='0'
									max='1'
									step='0.1'
									value={safeData.curviness}
									onChange={(e) => onChange('curviness', parseFloat(e.target.value))}
									className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
								/>
							</div>
						</div>
					</div>
				</div>

				<div className={SECTION_CLASS}>
					<label className={LABEL_CLASS}>Label Settings</label>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Visibility</label>
							<select
								className={ADMIN_INPUT_CLASS}
								value={safeData.labelDisplay}
								onChange={(e) => onChange('labelDisplay', e.target.value)}>
								<option value='always'>Always</option>
								<option value='hover'>Hover</option>
								<option value='none'>Hidden</option>
							</select>
						</div>
						<div className='space-y-2'>
							<label className={LABEL_CLASS}>Style</label>
							{/* Modified Style Selector to include Curved Option */}
							<div className='flex bg-card border border-border rounded-md p-1'>
								<button
									onClick={() => {
										onChange('labelStyle', 'box');
										onChange('textAlongLine', false);
									}}
									className={`flex-1 flex items-center justify-center py-1 rounded-[3px] text-xs transition-colors ${
										safeData.labelStyle === 'box' && !safeData.textAlongLine
											? 'bg-primary text-white shadow-sm'
											: 'text-muted-foreground hover:bg-muted'
									}`}
									title='Box Background'>
									<LayoutTemplate size={14} />
								</button>
								<button
									onClick={() => {
										onChange('labelStyle', 'ghost');
										onChange('textAlongLine', false);
									}}
									className={`flex-1 flex items-center justify-center py-1 rounded-[3px] text-xs transition-colors ${
										safeData.labelStyle === 'ghost' && !safeData.textAlongLine
											? 'bg-primary text-white shadow-sm'
											: 'text-muted-foreground hover:bg-muted'
									}`}
									title='Text Only'>
									<TypeIcon size={14} />
								</button>
								<button
									onClick={() => onChange('textAlongLine', true)}
									className={`flex-1 flex items-center justify-center py-1 rounded-[3px] text-xs transition-colors ${
										safeData.textAlongLine ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
									}`}
									title='Curved on Line'>
									<AlignCenter size={14} />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
