import { ArrowRight, Users, Map, BookOpen } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { clsx } from 'clsx';

export const CampaignCard = ({ campaign, onSelect }) => {
	const initial = (campaign.name?.[0] || 'C').toUpperCase();
	const bgImage = campaign.attributes?.background_image;
	const campaignIcon = campaign.attributes?.icon; // Check for icon in attributes
	const mapData = campaign.attributes?.map_data ? 'Atlas active' : 'No Atlas';

	// Fallback pattern if no image is provided
	const hasBg = !!bgImage;

	return (
		<div className='group relative flex flex-col h-full bg-card rounded-xl border border-border hover:border-primary shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden'>
			{/* Banner / Header Image */}
			<div className={clsx('relative h-32 w-full shrink-0 overflow-hidden', !hasBg && 'bg-muted')}>
				{hasBg ? (
					<img
						src={bgImage}
						alt='Campaign Cover'
						className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
					/>
				) : (
					<div
						className='absolute inset-0 opacity-10'
						style={{
							backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
							backgroundSize: '16px 16px',
						}}
					/>
				)}

				{/* Gradient Overlay for Text Readability/Transition */}
				<div className='absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent' />
			</div>

			{/* Card Content */}
			<div className='flex flex-col flex-1 px-6 pb-6 relative'>
				{/* Avatar Badge (Icon or Initial) */}
				<div className='-mt-12 mb-6'>
					<div className='w-20 h-20 border-border rounded-xl bg-background border hover:shadow-md flex items-center justify-center overflow-hidden transition-colors'>
						{campaignIcon ? (
							<img src={campaignIcon} alt={`${campaign.name} icon`} className='w-full h-full object-cover' />
						) : (
							<span className='text-4xl font-serif font-bold text-primary/80 group-hover:text-primary'>{initial}</span>
						)}
					</div>
				</div>

				{/* Title & Description */}
				<div className='mb-6'>
					<h3 className='text-[clamp(1rem,5vw,1.2rem)] font-bold font-serif text-foreground leading-tight mb-2 group-hover:text-primary transition-colors'>
						{campaign.name}
					</h3>
					<p className='text-sm text-muted-foreground line-clamp-5 leading-relaxed'>
						{campaign.description || 'A journey into the unknown.'}
					</p>
				</div>

				{/* Metadata / Stats Row */}
				<div className='mt-auto pt-4 border-t border-border/50 grid grid-cols-2 gap-4 mb-6'>
					<div className='flex flex-col'>
						<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 flex items-center gap-1.5'>
							<Users size={10} /> Party Size
						</span>
						<span className='text-sm font-medium text-foreground'>{campaign.characterNames?.length || 0} Heroes</span>
					</div>
					<div className='flex flex-col'>
						<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 flex items-center gap-1.5'>
							<Map size={10} /> Setting
						</span>
						<span className='text-sm font-medium text-foreground'>{mapData}</span>
					</div>
				</div>

				{/* Action Button */}
				<Button
					onClick={() => onSelect(campaign.id)}
					fullWidth
					variant='outline'
					className='group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors'
					icon={ArrowRight}>
					Enter Campaign
				</Button>
			</div>
		</div>
	);
};
