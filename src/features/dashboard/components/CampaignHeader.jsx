import { Layers, Scroll, MapPin, Users, Swords, Crown, Box } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { HighlightBadge } from '@/shared/components/ui/HighlightBadge';

export const CampaignHeader = ({ campaign, counts }) => {
	return (
		<div className='flex flex-col gap-4 mb-12 items-center text-center max-w-4xl mx-auto'>
			{/* 1. Meta Label */}
			<div className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/70'>
				<Crown size={12} />
				Campaign Chronicle
			</div>

			{/* 2. Title */}
			<h1 className='text-5xl md:text-7xl font-serif font-bold text-foreground tracking-tight leading-none'>
				{campaign?.name}
			</h1>

			{/* 3. Description (Limited width for readability) */}
			<div className='max-w-2xl text-base text-muted-foreground leading-relaxed font-serif'>
				<SmartMarkdown components={{ p: 'span' }}>{campaign?.description || 'No description available.'}</SmartMarkdown>
			</div>

			{/* 4. Stats Row (Using Swimlane Badge Style) */}
			<div className='flex flex-wrap justify-center gap-6 mt-4'>
				<HighlightBadge icon={Layers} count={counts?.sessions} label='Sessions' />
				<HighlightBadge icon={Crown} count={counts?.arcs} label='Story Arcs' />
				<HighlightBadge icon={Users} count={counts?.npcs} label='NPCs' />
				<HighlightBadge icon={MapPin} count={counts?.locations} label='Locations' />
				<HighlightBadge icon={Swords} count={counts?.encounters} label='Encounters' />
				<HighlightBadge icon={Scroll} count={counts?.quests} label='Quests' />
			</div>

			<div className='w-24 h-px bg-border mt-6' />
		</div>
	);
};
