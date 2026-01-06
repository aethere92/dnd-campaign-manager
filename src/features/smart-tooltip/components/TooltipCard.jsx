import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowRight, Heart, Crown, Shield, Wind } from 'lucide-react';
import { useSmartPosition } from '@/features/smart-tooltip/useSmartPosition';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

// SINGLE SOURCE OF TRUTH IMPORTS
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { getEntityPalette } from '@/domain/entity/config/entityColors';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import { TOOLTIP_PROFILES, DEFAULT_PROFILE } from '../config/tooltipProfiles';

// --- UTILS ---

const resolveField = (attrs, key) => {
	if (key === 'level_prefix') {
		const lvl = getAttributeValue(attrs, 'level');
		return lvl ? `Lvl ${lvl}` : null;
	}
	if (key === 'session_number_prefixed') {
		const num = getAttributeValue(attrs, ['session_number', 'number']);
		return num ? `Session ${num}` : null;
	}
	return getAttributeValue(attrs, key);
};

// --- MINI COMPONENTS ---

const StatusDot = ({ status }) => {
	if (!status) return null;
	const s = status.toLowerCase();
	const isDead = ['dead', 'destroyed', 'completed', 'failed'].includes(s);
	const isAlive = ['alive', 'active', 'in progress'].includes(s);

	let colorClass = 'bg-muted-foreground/50';
	if (isDead) colorClass = 'bg-red-500';
	if (isAlive) colorClass = 'bg-emerald-500';

	return (
		<div className='flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/90'>
			<span className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
			{status}
		</div>
	);
};

const TagText = ({ value, type }) => {
	if (!value) return null;
	const v = value.toLowerCase();

	let colorClass = 'text-muted-foreground';

	if (type === 'affinity') {
		if (['enemy', 'hostile'].includes(v)) colorClass = 'text-orange-600 dark:text-orange-400';
		if (['ally', 'friendly'].includes(v)) colorClass = 'text-blue-600 dark:text-blue-400';
	}

	return <span className={clsx('text-[10px] font-bold uppercase tracking-wide opacity-90', colorClass)}>{value}</span>;
};

// --- MAIN CARD ---

export const TooltipCard = ({ data, type, id, position, isLoading, onMouseEnter, onMouseLeave }) => {
	const navigate = useNavigate();

	// 1. Get Domain Configuration
	const config = getEntityConfig(type);
	const palette = getEntityPalette(type);
	const TypeIcon = config.icon;

	// 2. Get Layout Profile
	const profile = TOOLTIP_PROFILES[type] || DEFAULT_PROFILE;

	const { style, tooltipRef } = useSmartPosition(position, true);

	const handleClick = (e) => {
		e.stopPropagation();
		navigate(`/wiki/${type}/${id}`);
		onMouseLeave && onMouseLeave();
	};

	// 3. Dynamic Styles based on Entity Palette (500 shade)
	const primaryColor = palette[500];
	const fallbackGradient = {
		background: `linear-gradient(135deg, ${primaryColor}33 0%, ${primaryColor}11 100%)`,
	};

	if (isLoading) {
		return (
			<div
				ref={tooltipRef}
				style={style}
				className='bg-background/95 backdrop-blur p-4 rounded-lg shadow-xl border border-border text-xs text-muted-foreground'>
				Loading...
			</div>
		);
	}

	if (!data) return null;

	const attributes = parseAttributes(data.attributes);
	const image = resolveImageUrl(attributes, 'background');

	// Info Line
	const infoParts = (profile.subtitle || []).map((key) => resolveField(attributes, key)).filter(Boolean);
	const infoLine = infoParts.join(' • ');

	// Extra Data
	const hp = profile.features?.showHP ? getAttributeValue(attributes, ['hit points', 'hp']) : null;
	const armorClass = profile.features?.showArmorClass ? getAttributeValue(attributes, ['armor class', 'ac']) : null;
	const movement = profile.features?.showMovement ? getAttributeValue(attributes, ['movement', 'speed']) : null;
	const ruler = profile.features?.showRuler ? getAttributeValue(attributes, 'ruler') : null;

	// Personality Parsing
	let parsedPersonality = null;
	const personality = profile.features?.showPersonality ? getAttributeValue(attributes, 'personality') : null;
	if (personality) {
		if (Array.isArray(personality)) {
			parsedPersonality = personality.map((p) => p.value || p).join(' ');
		} else {
			parsedPersonality = personality;
		}
	}

	return (
		<div
			ref={tooltipRef}
			style={style}
			onClick={handleClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={clsx(
				'bg-background rounded-lg shadow-2xl ring-1 ring-border group flex flex-col w-[300px] overflow-hidden select-none',
				'hover:ring-2 transition-all duration-200'
			)}>
			{/* HEADER */}
			{image ? (
				<div className='h-28 w-full bg-muted relative shrink-0'>
					<img src={image} alt='' className='w-full h-full object-cover opacity-90' />
					<div className='absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent' />
				</div>
			) : (
				<div className='h-20 w-full relative overflow-hidden shrink-0' style={fallbackGradient}>
					<TypeIcon
						strokeWidth={1.5}
						className='absolute -bottom-3 -right-3 w-24 h-24 opacity-[0.07] -rotate-12 text-foreground'
						style={{ color: primaryColor }}
					/>
				</div>
			)}

			{/* CONTENT */}
			<div className={clsx('flex flex-col px-4 pb-3', image ? '-mt-8 relative z-10' : 'pt-2')}>
				{/* TITLE ROW */}
				<div className='flex justify-between items-end gap-2 mb-1'>
					<div className='min-w-0 flex-1'>
						<span
							className='text-[9px] font-bold uppercase tracking-wider block opacity-70 mb-0.5'
							style={{ color: primaryColor }}>
							{data.type}
						</span>
						<h3
							className={clsx(
								'font-serif font-bold text-xl leading-none truncate pr-1 drop-shadow-sm text-foreground'
							)}>
							{data.name}
						</h3>
					</div>
					{/* Floating Icon Badge */}
					<div
						className={clsx(
							'p-1.5 rounded-md border shadow-sm shrink-0 mb-0.5',
							image
								? 'bg-background/90 text-foreground border-transparent backdrop-blur'
								: 'bg-muted/30 border-border/50'
						)}>
						<TypeIcon size={18} strokeWidth={1.5} style={!image ? { color: primaryColor } : {}} />
					</div>
				</div>

				{/* SUBTITLE */}
				{infoLine && <div className='text-xs font-medium text-muted-foreground/90 mb-2 truncate'>{infoLine}</div>}

				{/* TAGS */}
				{(profile.tags?.length > 0 || hp) && (
					<div className='flex items-center gap-3 mb-3 border-b border-border/40 pb-2'>
						{hp && (
							<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground mr-1'>
								<Heart size={10} className='text-red-500/70 fill-red-500/10' /> {hp}
							</div>
						)}
						{armorClass && (
							<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground mr-1'>
								<Shield size={10} className='text-emerald-500/70 fill-emerald-500/10' /> {armorClass}
							</div>
						)}
						{movement && (
							<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground mr-1'>
								<Wind size={10} className='text-blue-500/70 fill-blue-500/10' /> {movement}
							</div>
						)}
						{profile.tags?.includes('status') && <StatusDot status={getAttributeValue(attributes, 'status')} />}
						{profile.tags?.includes('affinity') && (
							<TagText value={getAttributeValue(attributes, 'affinity')} type='affinity' />
						)}
						{profile.tags?.includes('priority') && (
							<TagText value={getAttributeValue(attributes, 'priority')} type='priority' />
						)}
					</div>
				)}

				{/* PERSONALITY */}
				{parsedPersonality && (
					<div className='mb-2 text-xs italic text-muted-foreground/80 leading-relaxed border-l-2 border-border/60 pl-2'>
						<SmartMarkdown inline={true} disableTooltips={true}>
							{`"${parsedPersonality}"`}
						</SmartMarkdown>
					</div>
				)}

				{/* DESCRIPTION */}
				{data.description && (
					<div className='text-xs text-muted-foreground/90'>
						<div className='max-h-[140px] overflow-y-auto pr-2 custom-scrollbar leading-relaxed'>
							<SmartMarkdown inline={true} disallowedElements={['h1', 'h2', 'h3', 'img']} disableTooltips={true}>
								{data.description}
							</SmartMarkdown>
						</div>
					</div>
				)}
			</div>

			{/* FOOTER */}
			<div className='bg-muted/30 py-1.5 px-3 border-t border-border flex justify-between items-center mt-auto shrink-0'>
				<span className='text-[9px] text-muted-foreground/50 font-medium'>
					{ruler && (
						<span className='flex items-center gap-1'>
							<Crown size={8} /> {ruler}
						</span>
					)}
				</span>

				<span className='text-[9px] font-semibold text-muted-foreground/60 flex items-center gap-1 group-hover:text-amber-600 transition-colors'>
					Open Wiki <ArrowRight size={8} />
				</span>
			</div>
		</div>
	);
};
