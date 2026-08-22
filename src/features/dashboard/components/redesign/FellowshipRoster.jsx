import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Shield, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { getEntityColor } from '@/domain/entity/config/entityConfig';
import { SectionHeading } from './SectionHeading';

// Clean a stored image path the way resolveImageUrl does and prefix the Vite base.
const withBase = (raw) => {
	if (!raw) return null;
	if (/^https?:|^data:/i.test(raw)) return raw;
	const clean = String(raw).trim().replace(/(\.\.\/)+/g, '').replace(/^\//, '');
	return `${import.meta.env.BASE_URL}${clean}`;
};

/**
 * Ordered art candidates for a character card, best fit first:
 *   1. a tall portrait derived from the icon path (…_icon.webp → …_portrait.webp)
 *   2. an icon/attribute that is already a portrait
 *   3. the stored background_image (usually a wide header banner)
 * The card walks this list on <img> error, then degrades to a medallion.
 */
const portraitCandidates = (char) => {
	const attrs = char.attributes || {};
	const icon = char.icon || attrs.icon || attrs.Icon || attrs.portrait || attrs.Portrait;
	const bg = attrs.background_image || attrs.background || attrs.image;
	const out = [];
	if (icon && /_icon\.(webp|png|jpe?g)$/i.test(icon)) out.push(icon.replace(/_icon\.(webp|png|jpe?g)$/i, '_portrait.$1'));
	if (icon && /portrait/i.test(icon)) out.push(icon);
	if (bg) out.push(bg);
	// de-dupe while preserving order
	return [...new Set(out.map(withBase).filter(Boolean))];
};

/**
 * The party as a portrait roster.
 *
 * Full painted portrait fills the card when the character has real art; when
 * only a small icon exists (the "inconsistent art" reality) it degrades to a
 * crisp circular medallion on a tinted panel rather than a blurry upscale.
 */
export function FellowshipRoster({ party = [] }) {
	if (!party.length) return null;

	return (
		<>
			<SectionHeading icon={Users} eyebrow='The Fellowship' title={`${party.length} heroes at your side`} />

			<div className='mt-10 flex flex-wrap justify-center gap-3 sm:gap-4 max-w-6xl mx-auto'>
				{party.map((char, i) => (
					<CharacterCard key={char.id} char={char} tint={ROSTER_TINTS[i % ROSTER_TINTS.length]} />
				))}
			</div>
		</>
	);
}

// Distinct per-card accent hues drawn from the entity palette, so six cards
// read as a set without any two adjacent glows matching.
const ROSTER_TINTS = [
	getEntityColor('character'),
	getEntityColor('npc'),
	getEntityColor('quest'),
	getEntityColor('location'),
	getEntityColor('faction'),
	getEntityColor('encounter'),
];

function CharacterCard({ char, tint }) {
	const routes = useCampaignRoutes();
	const { attributes, name, race, level } = char;

	// Walk the ordered art candidates; advance on load error. When we run out,
	// `idx` points past the end and the card shows the medallion fallback.
	const candidates = portraitCandidates(char);
	const [idx, setIdx] = useState(0);
	const art = candidates[idx] || null;
	const hasFullArt = Boolean(art);

	// The icon is the small square used for the medallion fallback.
	const iconArt = withBase(char.icon || attributes?.icon || attributes?.Icon);

	const charClass = char.class || attributes?.class || 'Adventurer';
	const hp = attributes?.['hit points'] || attributes?.hp;
	const ac = attributes?.['armor class'] || attributes?.ac;

	const href = routes.wikiEntity('character', char.id);
	const style = {
		'--pc': tint,
		borderColor: 'color-mix(in srgb, var(--pc) 30%, var(--border))',
		boxShadow: '0 18px 44px -30px color-mix(in srgb, var(--pc) 90%, transparent)',
	};

	return (
		<Link
			to={href}
			style={style}
			className={clsx(
				'group relative flex flex-col justify-end overflow-hidden rounded-xl',
				'border transition-all duration-300 hover:-translate-y-1.5',
				'aspect-[3/4.4]',
				'w-[140px] sm:w-[155px] lg:w-[165px]'
			)}
			data-fellow>
			{/* art layer — <img> so we can catch load errors and fall through */}
			<div
				className='absolute inset-0'
				style={{
					background:
						'linear-gradient(160deg, color-mix(in srgb, var(--pc) 18%, var(--card)), var(--card) 72%)',
				}}
			/>
			{hasFullArt && (
				<img
					src={art}
					alt=''
					loading='lazy'
					onError={() => setIdx((i) => i + 1)}
					className='absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105'
				/>
			)}

			{/* scrim for legibility (only needed over full art) */}
			{hasFullArt && <div className='dash-portrait-scrim' />}

			{/* level pill */}
			{level != null && (
				<span
					className='absolute top-2.5 right-2.5 z-10 text-[9.5px] font-bold uppercase tracking-wider text-white rounded-full px-2 py-0.5 backdrop-blur-sm border'
					style={{
						background: 'color-mix(in srgb, var(--pc) 55%, rgba(0,0,0,0.4))',
						borderColor: 'color-mix(in srgb, var(--pc) 60%, transparent)',
					}}>
					Lv {level}
				</span>
			)}

			{/* medallion when there's no full art */}
			{!hasFullArt && (
				<div className='relative z-10 pt-7 px-3 flex justify-center'>
					<div
						className='w-16 h-16 rounded-full bg-cover bg-center border-2 flex items-center justify-center'
						style={{
							backgroundImage: iconArt ? `url("${iconArt}")` : undefined,
							borderColor: 'color-mix(in srgb, var(--pc) 60%, transparent)',
							boxShadow: '0 0 26px -6px color-mix(in srgb, var(--pc) 70%, transparent)',
							background: iconArt ? undefined : 'color-mix(in srgb, var(--pc) 20%, var(--muted))',
						}}>
						{!iconArt && <User size={26} className='text-foreground/50' />}
					</div>
				</div>
			)}

			{/* identity + stats */}
			<div className={clsx('relative z-10 px-3 text-center', hasFullArt ? 'pb-3.5 pt-8 mt-auto' : 'pb-3.5 pt-4')}>
				<h3
					className={clsx(
						'font-display font-bold text-base sm:text-lg leading-tight line-clamp-1',
						hasFullArt && 'text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]'
					)}>
					{name}
				</h3>
				<p
					className={clsx(
						'text-[9px] uppercase font-bold tracking-[0.1em] mt-0.5 line-clamp-1',
						hasFullArt ? 'text-white/75 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]' : 'text-muted-foreground'
					)}>
					{[race, charClass].filter(Boolean).join(' · ')}
				</p>

				{(hp || ac) && (
					<div
						className={clsx(
							'flex justify-center gap-4 mt-2.5 pt-2.5 border-t',
							hasFullArt ? 'border-white/15' : 'border-border'
						)}>
						{hp && (
							<span
								className={clsx(
									'inline-flex items-center gap-1 text-xs font-bold',
									hasFullArt ? 'text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]' : 'text-foreground'
								)}>
								<Heart size={12} className='text-red-500' /> {hp}
							</span>
						)}
						{ac && (
							<span
								className={clsx(
									'inline-flex items-center gap-1 text-xs font-bold',
									hasFullArt ? 'text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]' : 'text-foreground'
								)}>
								<Shield size={12} className='text-primary' /> {ac}
							</span>
						)}
					</div>
				)}
			</div>
		</Link>
	);
}
