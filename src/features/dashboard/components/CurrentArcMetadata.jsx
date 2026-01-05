import { Map, Crown } from 'lucide-react'; // Swapped icons
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const CurrentArcMetadata = ({ arc }) => {
	return (
		<div className='bg-card border border-border rounded-xl p-8 h-full flex flex-col hover:shadow-sm relative overflow-hidden group'>
			{/* Subtle background decoration - Moved to bottom right and changed to Map for adventure feel */}
			<div className='absolute -right-10 -bottom-10 text-muted-foreground/5 pointer-events-none group-hover:scale-110 transition-transform duration-1000'>
				<Map size={180} />
			</div>

			{/* Metadata Header */}
			<div className='relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-6'>
				<span className='flex items-center gap-1.5'>
					{/* Changed Hash to Layers for a "Story Layer" feel */}
					{arc?.order ? `# Arc ${arc.order}` : 'Current Arc'}
				</span>
				<span className='text-muted-foreground/30'>|</span>
				<span className='text-muted-foreground'>{arc?.attributes?.type || 'Major Arc'}</span>
			</div>

			{/* Title */}
			<h2 className='relative z-10 text-4xl font-serif font-bold text-foreground mb-6 leading-tight'>
				{arc?.title || 'Uncategorized Stories'}
			</h2>

			{/* Description */}
			<div className='relative z-10 text-sm text-muted-foreground leading-relaxed font-serif prose prose-invert max-w-none'>
				<SmartMarkdown components={{ p: 'span' }}>
					{arc?.description || 'No description available for this narrative arc.'}
				</SmartMarkdown>
			</div>
		</div>
	);
};
