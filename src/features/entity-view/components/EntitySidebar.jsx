import { Tag, Network, Shield, Activity } from 'lucide-react';
import { clsx } from 'clsx';

// --- SUB-COMPONENTS ---
const AbilityGrid = ({ stats }) => (
	<div className='grid grid-cols-3 gap-2 mt-2 mb-4'>
		{stats.map((stat, i) => (
			<div
				key={i}
				className='bg-white border border-slate-200 rounded p-1.5 text-center flex flex-col items-center shadow-sm'>
				<span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none'>{stat.name}</span>
				<span className='text-lg font-bold text-slate-800 leading-none my-1'>{stat.score}</span>
				<span className='text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 rounded-full'>{stat.mod}</span>
			</div>
		))}
	</div>
);

const TagList = ({ tags }) => (
	<div className='flex flex-wrap gap-1.5 mt-1 mb-3'>
		{tags.map((item, i) => (
			<span
				key={i}
				className='inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200'>
				{item}
			</span>
		))}
	</div>
);

const StandardTrait = ({ label, value, index }) => (
	<div
		className={clsx(
			'flex justify-between items-start px-2 py-1.5 rounded',
			index % 2 === 0 ? 'bg-background' : 'bg-transparent'
		)}>
		<span className='text-[11px] font-medium text-slate-400 capitalize shrink-0 mr-2 mt-0.5'>{label}</span>
		<span className='text-xs font-semibold text-slate-700 text-right leading-snug'>{value}</span>
	</div>
);

// --- HELPER: Connection Badge Colors ---
const getRoleStyle = (roleStr) => {
	const r = roleStr?.toLowerCase() || '';

	if (r.includes('enemy') || r.includes('threat') || r.includes('hostile')) {
		return 'bg-red-50 text-red-700 border-red-200';
	}
	if (r.includes('ally') || r.includes('allied') || r.includes('friend')) {
		return 'bg-emerald-50 text-emerald-700 border-emerald-200';
	}
	if (r.includes('ruled') || r.includes('leader') || r.includes('captain')) {
		return 'bg-amber-50 text-amber-700 border-amber-200';
	}
	// Default
	return 'bg-slate-100 text-slate-500 border-slate-200';
};

// --- MAIN COMPONENT ---
export const EntitySidebar = ({ traits, connections }) => {
	const textTraits = traits.filter((t) => t.displayType === 'text');
	const specialTraits = traits.filter((t) => t.displayType !== 'text');

	return (
		<div className='space-y-6'>
			{/* 1. Standard Traits Table */}
			{textTraits.length > 0 && (
				<div className='bg-muted border border-slate-200 rounded-lg overflow-hidden'>
					<div className='px-3 py-2 border-b border-slate-200 bg-slate-100/50'>
						<h3 className='text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2'>
							<Tag size={10} /> Attributes
						</h3>
					</div>
					<div className='p-1'>
						{textTraits.map((prop, idx) => (
							<StandardTrait key={prop.key} label={prop.key} value={prop.value} index={idx} />
						))}
					</div>
				</div>
			)}

			{/* 2. Special Visual Blocks */}
			{specialTraits.length > 0 && (
				<div className='space-y-4 px-1'>
					{specialTraits.map((prop) => {
						if (prop.displayType === 'stat-grid') {
							return (
								<div key={prop.key}>
									<h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2'>
										<Activity size={10} /> {prop.key}
									</h3>
									<AbilityGrid stats={prop.value} />
								</div>
							);
						}
						if (prop.displayType === 'tags') {
							return (
								<div key={prop.key}>
									<h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2'>
										<Shield size={10} /> {prop.key}
									</h3>
									<TagList tags={prop.value} />
								</div>
							);
						}
						return null;
					})}
				</div>
			)}

			{/* 3. Connections */}
			{connections.length > 0 && (
				<div>
					<h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 px-1'>
						<Network size={10} /> Connections
					</h3>
					<div className='space-y-2'>
						{connections.map((rel, i) => (
							<div
								key={i}
								className={clsx(
									'group flex items-center justify-between p-2 rounded-lg border bg-background transition-all cursor-pointer',
									'border-slate-200 hover:border-slate-300 hover:shadow-sm',
									rel.theme.hover
								)}>
								<div className='flex items-center gap-2.5 flex-1 min-w-0'>
									<div className={clsx('shrink-0', rel.theme.text)}>
										<rel.theme.Icon size={14} />
									</div>
									<span className='text-sm font-bold text-slate-700 truncate group-hover:text-foreground transition-colors'>
										{rel.name}
									</span>
								</div>

								{/* UPDATED: Dynamic Badge Color based on Role */}
								<span
									className={clsx(
										'shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ml-2 max-w-[45%] truncate',
										getRoleStyle(rel.role)
									)}>
									{rel.role}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
