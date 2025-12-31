import React from 'react';
import {
	Swords,
	Shield,
	Zap,
	Skull,
	Footprints,
	MessageSquare,
	Hand,
	Dices,
	Target,
	Activity,
	ArrowRight,
	CornerDownRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import EntityLink from '@/domain/entity/components/EntityLink';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { useTheme } from '@/shared/hooks/useTheme'; // FIX: Import theme hook

// ... (getActionIcon helper remains the same) ...
const getActionIcon = (type) => {
	switch (type?.toLowerCase()) {
		case 'attack':
			return Swords;
		case 'spell':
			return Zap;
		case 'move':
			return Footprints;
		case 'check':
			return Dices;
		case 'save':
			return Shield;
		case 'item':
			return Hand;
		case 'legendary':
			return Skull;
		case 'social':
			return MessageSquare;
		default:
			return Activity;
	}
};

const CombatLogEntry = ({ action }) => {
	const { isFriendly, actor, target, description, result, effect, type } = action;
	const ActionIcon = getActionIcon(type);
	const { theme } = useTheme(); // FIX: Use app theme state

	// FIX: Logic based on explicit App Theme, ignoring System Preference
	const isDark = theme === 'dark';

	// Background:
	// - Friendly: None
	// - Hostile:
	//    - Dark: Red-900 at 10% (Visible on black)
	//    - Light/DND: Red-500 at 5% (Subtle on parchment/white)
	const rowBg = isFriendly ? '' : isDark ? 'bg-red-900/5' : 'bg-red-500/2';

	// Text Colors:
	// - Dark: Lighter shades (400)
	// - Light/DND: Darker shades (700)
	const manualActorColor = isFriendly
		? isDark
			? 'text-emerald-400'
			: 'text-emerald-700'
		: isDark
		? 'text-red-400'
		: 'text-red-700';

	const effectIconColor = isDark ? 'text-amber-500' : 'text-amber-600';

	return (
		<div
			className={clsx(
				'flex items-start gap-2.5 p-2.5 border-b border-border last:border-0 text-sm transition-colors group',
				'hover:bg-muted/50',
				rowBg
			)}>
			{/* 1. Large Sidebar Icon */}
			<div className='shrink-0 mt-0.5'>
				<EntityIcon type={actor.type} customIconUrl={actor.iconUrl} size={28} className='rounded opacity-90' />
			</div>

			{/* 2. Content */}
			<div className='flex-1 min-w-0'>
				{/* Header Line */}
				<div className='flex flex-wrap items-center gap-1 mb-1 leading-snug'>
					{/* Actor Name */}
					{actor.id ? (
						<EntityLink
							id={actor.id}
							type={actor.type}
							inline={true}
							showIcon={true}
							customIconUrl={actor.iconUrl}
							className='font-serif font-bold text-sm !no-underline hover:underline'>
							{actor.name}
						</EntityLink>
					) : (
						// Manual Entry
						<span
							className={clsx(
								'font-serif font-bold text-sm flex items-center gap-1.5 cursor-default',
								manualActorColor
							)}>
							<EntityIcon type={actor.type} size={14} inline />
							{actor.name}
						</span>
					)}

					{/* Action Badge */}
					<span className='text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider flex border border-border items-center gap-1 rounded-sm px-1.5 bg-background/50'>
						<ActionIcon size={10} />
						{type}
					</span>

					{/* Target */}
					{target && (
						<div className='flex items-center gap-1.5 text-muted-foreground'>
							<ArrowRight size={10} className='opacity-50' />

							{target.id ? (
								<EntityLink
									id={target.id}
									type={target.type}
									inline={true}
									showIcon={true}
									customIconUrl={target.iconUrl}
									className='font-serif font-semibold text-sm !no-underline hover:underline'>
									{target.name}
								</EntityLink>
							) : (
								<span className='font-serif font-semibold text-foreground text-sm flex items-center gap-1.5 cursor-default'>
									<EntityIcon type={target.type} size={14} inline />
									{target.name}
								</span>
							)}
						</div>
					)}

					{/* Result Badge */}
					{result && (
						<span className='ml-auto text-[10px] font-bold text-foreground/80 bg-background/80 px-1.5 py-0.5 rounded border border-border whitespace-nowrap'>
							{result}
						</span>
					)}
				</div>

				{/* Description */}
				{description && (
					<div className='text-xs text-muted-foreground leading-relaxed pl-0.5'>
						<SmartMarkdown components={{ p: 'span' }}>{description}</SmartMarkdown>
					</div>
				)}

				{/* Effect */}
				{effect && (
					<div className='mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground w-fit px-1.5 py-0.5 rounded -ml-1'>
						<CornerDownRight size={10} className={effectIconColor} />
						<span className='italic opacity-90'>
							<SmartMarkdown components={{ p: 'span' }}>{effect}</SmartMarkdown>
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export const EncounterTimeline = ({ rounds }) => {
	if (!rounds || Object.keys(rounds).length === 0) return null;

	return (
		<div className='my-6'>
			<h3 className='text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2'>
				<Swords size={14} className='text-primary' /> Combat Log
			</h3>

			<div className='border border-border rounded-lg overflow-hidden bg-background'>
				{Object.entries(rounds).map(([roundNum, actions]) => (
					<div key={roundNum}>
						{/* Round Header */}
						<div className='bg-muted/80 border-b border-border px-3 py-1.5 flex items-center justify-between'>
							<span className='text-xs font-serif font-bold text-foreground'>Round {roundNum}</span>
							<span className='text-[9px] font-bold uppercase text-muted-foreground tracking-wider'>
								{actions.length} Turns
							</span>
						</div>

						{/* Actions Group */}
						<div
							className={clsx(
								'bg-background',
								Number(roundNum) !== Object.keys(rounds).length && 'border-b border-border'
							)}>
							{actions.map((action) => (
								<CombatLogEntry key={action.id} action={action} />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
