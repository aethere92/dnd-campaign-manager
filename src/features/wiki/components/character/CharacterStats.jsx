import { Shield, Heart, Wind } from 'lucide-react';
import { SectionDivider } from '@/shared/components/ui/SectionDivider';

const parseStat = (str) => {
	if (!str) return { label: '???', value: '-' };
	const match = str.match(/^([A-Z]{3})\s+(.*)$/);
	if (!match) return { label: str.substring(0, 3), value: str };
	return { label: match[1], value: match[2] };
};

const StatPill = ({ raw }) => {
	const { label, value } = parseStat(raw);
	return (
		<div className='flex flex-col items-center justify-center bg-muted/20 border border-border/50 rounded-md py-1.5 px-3 min-w-[70px]'>
			<span className='text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5'>{label}</span>
			<span className='text-sm font-bold text-foreground font-serif leading-none'>{value}</span>
		</div>
	);
};

const VitalPill = ({ label, value, icon: Icon, color }) => (
	<div className='flex flex-col items-center justify-center bg-muted/20 border border-border/50 rounded-md py-1.5 px-4 min-w-[80px]'>
		<div className='flex items-center gap-1.5 mb-0.5 opacity-80'>
			<Icon size={10} className={color} />
			<span className='text-[9px] font-bold uppercase text-muted-foreground tracking-wider'>{label}</span>
		</div>
		<span className='text-base font-serif font-bold text-foreground leading-none'>{value || '-'}</span>
	</div>
);

export const CharacterStats = ({ attributes }) => {
	const stats = attributes['ability score'] || attributes['stats'] || [];
	const ac = attributes['armor class'] || attributes['ac'];
	const hp = attributes['hit points'] || attributes['hp'];
	const speed = attributes['speed'];

	return (
		<div>
			<div className='flex flex-wrap items-center justify-center gap-6'>
				{/* 1. Ability Scores */}
				<div className='flex flex-wrap justify-center gap-2'>
					{stats.map((s, i) => (
						<StatPill key={i} raw={s} />
					))}
				</div>

				{/* Vertical Divider (Hidden on small mobile) */}
				<div className='hidden sm:block w-px h-8 bg-border/40' />

				{/* 2. Vitals */}
				<div className='flex flex-wrap justify-center gap-2'>
					<VitalPill label='AC' value={ac} icon={Shield} color='text-emerald-500' />
					<VitalPill label='HP' value={hp} icon={Heart} color='text-red-500' />
					<VitalPill label='Speed' value={speed} icon={Wind} color='text-blue-500' />
				</div>
			</div>
			<SectionDivider />
		</div>
	);
};
