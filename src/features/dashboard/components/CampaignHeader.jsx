import { Layers, Scroll, MapPin, Users, Swords, Crown } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { HighlightBadge } from '@/shared/components/ui/HighlightBadge';

export const CampaignHeader = ({ campaign, counts }) => {
	const bgImage = campaign?.attributes?.background_image || campaign?.attributes?.header_image;

	return (
		<div className='relative w-full mb-6 flex flex-col items-center text-center'>
			{/* --- Subtle Watermark Background Layer --- */}
			{bgImage && (
				<div className='absolute -top-6 -left-6 -right-6 bottom-0 z-0 pointer-events-none flex justify-center'>
					{/* 
					  CSS mask-image forces the actual image pixels to turn transparent at the bottom.
					  This guarantees a flawless fade into the background without spilling into the cards below.
					*/}
					<div
						className='w-full max-w-[1400px] h-full relative'
						style={{
							maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
							WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
						}}>
						<img
							src={bgImage}
							alt=''
							className='w-full h-full object-cover opacity-55 md:opacity-55 mix-blend-luminosity dark:mix-blend-screen'
						/>
						{/* Left & Right edge fading so it melts horizontally into the page background */}
						<div className='absolute inset-0 bg-gradient-to-r from-background via-transparent to-background' />
					</div>
				</div>
			)}

			{/* --- Content Layer (Original Clean Aesthetic) --- */}
			<div className='relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4 pt-8 pb-4'>
				{/* 1. Meta Label */}
				<div className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>
					<Crown size={12} />
					Campaign Chronicle
				</div>

				{/* 2. Title */}
				<h1 className='text-5xl md:text-7xl font-serif font-bold text-foreground tracking-tight leading-none'>
					{campaign?.name}
				</h1>

				{/* 3. Description */}
				<div className='max-w-2xl text-base text-muted-foreground leading-relaxed font-serif mt-2'>
					<SmartMarkdown components={{ p: 'span' }}>
						{campaign?.description || 'No description available.'}
					</SmartMarkdown>
				</div>

				{/* 4. Stats Row */}
				<div className='flex flex-wrap justify-center gap-6 mt-6'>
					<HighlightBadge icon={Layers} count={counts?.sessions} label='Sessions' />
					<HighlightBadge icon={Crown} count={counts?.arcs} label='Story Arcs' />
					<HighlightBadge icon={Users} count={counts?.npcs} label='NPCs' />
					<HighlightBadge icon={MapPin} count={counts?.locations} label='Locations' />
					<HighlightBadge icon={Swords} count={counts?.encounters} label='Encounters' />
					<HighlightBadge icon={Scroll} count={counts?.quests} label='Quests' />
				</div>

				{/* Decorative bottom divider */}
				<div className='w-24 h-px bg-border mt-10 opacity-50' />
			</div>
		</div>
	);
};
