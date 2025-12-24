import { useMemo } from 'react';
import { Tag, Network, Shield, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '../../../components/entity/EntityIcon';
import EntityLink from '../../../components/entity/EntityLink';
import { capitalize, toTitleCase } from '../../../utils/text/textProcessing';

// --- SUB-COMPONENTS ---
const AbilityGrid = ({ stats }) => (
	<div className='grid grid-cols-3 gap-2 mt-2 mb-4'>
		{stats.map((stat, i) => (
			<div
				key={i}
				className='bg-white/60 border border-stone-200/80 rounded p-1.5 text-center flex flex-col items-center shadow-sm backdrop-blur-sm'>
				<span className='text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none'>{stat.name}</span>
				<span className='text-lg font-bold text-stone-800 leading-none my-1 font-serif'>{stat.score}</span>
				<span className='text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 rounded-full'>{stat.mod}</span>
			</div>
		))}
	</div>
);

const TagList = ({ tags }) => (
	<div className='flex flex-wrap gap-1.5 mt-1 mb-3'>
		{tags.map((item, i) => (
			<span
				key={i}
				className='inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200/60 shadow-sm'>
				{toTitleCase(item)} {/* Changed to toTitleCase for consisteny */}
			</span>
		))}
	</div>
);

const StandardTrait = ({ label, value, index }) => (
	<div
		className={clsx(
			'flex justify-between items-baseline px-3 py-2 border-b border-stone-200/40 last:border-0',
			index % 2 === 0 ? 'bg-white/40' : 'bg-transparent'
		)}>
		<span className='text-[10px] font-bold uppercase tracking-widest text-stone-500/90 shrink-0 mr-4'>{label}</span>
		<span className='text-[13px] font-semibold text-stone-800 text-right leading-snug break-words'>
			{/* Changed to toTitleCase to handle "alive" -> "Alive", "neutral good" -> "Neutral Good" */}
			{typeof value === 'string' ? toTitleCase(value) : value}
		</span>
	</div>
);

// --- HELPER: Connection Badge Colors ---
const getRoleStyle = (roleStr) => {
	const r = roleStr?.toLowerCase() || '';

	if (r.includes('enemy') || r.includes('threat') || r.includes('hostile')) {
		return 'bg-red-50 text-red-700 border-red-200/60';
	}
	if (r.includes('ally') || r.includes('allied') || r.includes('friend')) {
		return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
	}
	if (r.includes('ruled') || r.includes('leader') || r.includes('captain')) {
		return 'bg-amber-50 text-amber-700 border-amber-200/60';
	}
	return 'bg-stone-100 text-stone-500 border-stone-200/60';
};

// --- NEW COMPONENT: Type Divider ---
const TypeDivider = ({ label }) => (
	<div className='flex items-center gap-2 my-3'>
		<div className='h-px bg-stone-200 flex-1' />
		<span className='text-[9px] font-bold text-stone-400 uppercase tracking-widest'>{label}</span>
		<div className='h-px bg-stone-200 flex-1' />
	</div>
);

// --- MAIN COMPONENT ---
export const EntitySidebar = ({ traits, connections }) => {
	const textTraits = traits.filter((t) => t.displayType === 'text');
	const specialTraits = traits.filter((t) => t.displayType !== 'text');

	// Group connections by Type Label
	const groupedConnections = useMemo(() => {
		if (!connections || connections.length === 0) return [];

		// 1. Sort by Type, then Name
		const sorted = [...connections].sort((a, b) => {
			const typeA = a.typeLabel || 'Other';
			const typeB = b.typeLabel || 'Other';
			const compareType = typeA.localeCompare(typeB);
			if (compareType !== 0) return compareType;
			return (a.name || '').localeCompare(b.name || '');
		});

		// 2. Group for rendering
		const groups = [];
		let currentType = null;
		let currentGroup = null;

		sorted.forEach((item) => {
			const type = item.typeLabel || 'Other';
			if (type !== currentType) {
				currentType = type;
				currentGroup = { type, items: [] };
				groups.push(currentGroup);
			}
			currentGroup.items.push(item);
		});

		return groups;
	}, [connections]);

	return (
		<div className='space-y-6 font-sans'>
			{/* 1. Standard Traits Table */}
			{textTraits.length > 0 && (
				<div className='bg-stone-50/50 border border-stone-200 rounded-lg overflow-hidden'>
					{/* Header */}
					<div className='px-3 py-2 border-b border-stone-200 bg-stone-100/40 flex items-center gap-2'>
						<Tag size={12} className='text-amber-700' />
						<h3 className='text-[11px] font-bold text-amber-900/80 uppercase tracking-widest'>Attributes</h3>
					</div>

					{/* Content */}
					<div className='flex flex-col'>
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
									<h3 className='text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-2 ml-1'>
										<Activity size={10} /> {prop.key}
									</h3>
									<AbilityGrid stats={prop.value} />
								</div>
							);
						}
						if (prop.displayType === 'tags') {
							return (
								<div key={prop.key}>
									<h3 className='text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-2 ml-1'>
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

			{/* 3. Connections (Grouped with Dividers) */}
			{groupedConnections.length > 0 && (
				<div>
					<h3 className='text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2 px-1'>
						<Network size={10} /> Connections
					</h3>

					<div className='space-y-1'>
						{groupedConnections.map((group, gIdx) => (
							<div key={group.type}>
								{/* Divider (skip for first one if desired, currently showing for all as per design pattern) */}
								<TypeDivider label={group.type} />

								<div className='space-y-2'>
									{group.items.map((rel, i) => (
										<EntityLink
											key={rel.id}
											id={rel.id}
											type={rel.typeLabel}
											inline={true}
											showIcon={false}
											className={clsx(
												'!flex !w-full !items-center !justify-between !p-2 !rounded-lg !border !bg-white/60 !transition-all !cursor-pointer !no-underline',
												'!border-stone-200 hover:!border-amber-300 hover:!shadow-sm hover:!bg-white',
												rel.theme.hover
											)}>
											<div className='flex items-center gap-2.5 flex-1 min-w-0'>
												<EntityIcon type={rel.typeLabel} size={14} className='opacity-80 group-hover:opacity-100' />
												<span className='text-sm font-semibold text-stone-700 truncate group-hover:text-foreground transition-colors'>
													{rel.name}
												</span>
											</div>
											<span
												className={clsx(
													'shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ml-2 max-w-[45%] truncate',
													getRoleStyle(rel.role)
												)}>
												{rel.role}
											</span>
										</EntityLink>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
