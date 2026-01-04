import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Footprints, User } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { clsx } from 'clsx';

export const PartyWidget = ({ party }) => {
	const navigate = useNavigate();

	if (!party || party.length === 0) return null;

	const handleCardClick = (id, e) => {
		if (e.target.closest('a')) return;
		navigate(`/wiki/character/${id}`);
	};

	return (
		<div className='w-full'>
			<div className='flex items-center justify-between mb-4'>
				<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>The Party</h4>
			</div>

			{/* CHANGED: xl:grid-cols-6 to fit 6 cards in a row */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
				{party.map((char) => (
					<PartyCard key={char.id} char={char} onClick={(e) => handleCardClick(char.id, e)} />
				))}
			</div>
		</div>
	);
};

const PartyCard = ({ char, onClick }) => {
	const { attributes, name, race, level, icon, description } = char;

	const hp = attributes?.['hit points'] || '—';
	const ac = attributes?.['armor class'] || '—';

	// CHANGED: Extract Speed instead of Passive Perception
	// Usually stored as "30ft." or just "30"
	const speed = attributes?.speed || '—';

	const charClass = char.class || attributes?.class || 'Unknown Class';
	const bgImage = attributes?.background_image || attributes?.header_image;

	return (
		<div
			onClick={onClick}
			className='group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col h-full'>
			{/* --- Header Banner --- */}
			<div className='h-24 bg-muted relative overflow-hidden'>
				{bgImage ? (
					<img
						src={bgImage}
						alt='Background'
						className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80'
					/>
				) : (
					<div className='w-full h-full bg-gradient-to-br from-primary/5 to-muted' />
				)}
				<div className='absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent' />
			</div>

			{/* --- Body Content --- */}
			<div className='relative px-5 pb-4 pt-0 flex-1 flex flex-col'>
				<div className='flex justify-between items-end -mt-10 mb-3'>
					{/* Avatar */}
					<div className='w-16 h-16 rounded-xl border-4 border-card bg-muted shadow-sm overflow-hidden shrink-0 z-10 group-hover:scale-105 transition-transform'>
						{icon ? (
							<img src={icon} alt={name} className='w-full h-full object-cover' />
						) : (
							<div className='w-full h-full flex items-center justify-center bg-primary/10 text-primary'>
								<User size={24} />
							</div>
						)}
					</div>

					{/* Level Badge */}
					<div className='mb-1 bg-background/80 backdrop-blur border border-border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm'>
						LVL {level || '?'}
					</div>
				</div>

				{/* Identity */}
				<div className='mb-3'>
					<h3 className='font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1'>
						<SmartMarkdown>{name}</SmartMarkdown>
					</h3>
					<p className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 truncate'>
						{race} <span className='opacity-30 mx-1'>|</span> {charClass}
					</p>
				</div>

				{/* Description (Trimmed) */}
				{/* CHANGED: Increased height (h-20) and line-clamp (4) for taller cards */}
				<div className='text-xs text-muted-foreground line-clamp-4 mb-4 h-20 leading-relaxed'>
					<SmartMarkdown components={{ p: 'span' }}>{description || 'No description available.'}</SmartMarkdown>
				</div>

				{/* Combat Strip */}
				{/* CHANGED: Swapped Eye (PP) for Footprints (Speed) */}
				<div className='mt-auto pt-3 border-t border-border/50 grid grid-cols-3 gap-2'>
					<StatItem icon={Heart} label='HP' value={hp} color='text-red-500' />
					<StatItem icon={Shield} label='AC' value={ac} color='text-amber-500' />
					<StatItem icon={Footprints} label='SPD' value={speed} color='text-emerald-500' />
				</div>
			</div>
		</div>
	);
};

const StatItem = ({ icon: Icon, label, value, color }) => (
	<div className='flex flex-col items-center justify-center p-1.5 rounded bg-muted/30 group-hover:bg-muted/50 transition-colors'>
		<div className='flex items-center gap-1.5 text-muted-foreground mb-0.5'>
			<Icon size={10} className={clsx('opacity-70', color)} />
			<span className='text-[9px] font-bold uppercase tracking-wider'>{label}</span>
		</div>
		<span className='text-sm font-bold font-mono text-foreground'>{value}</span>
	</div>
);
