import { BookOpen, ArrowRight, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';

export const CampaignCard = ({ campaign, onSelect }) => {
	const initial = (campaign.name?.[0] || 'C').toUpperCase();

	return (
		<div className='bg-background/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all p-6 flex flex-col h-full border-t-4 border-t-amber-600'>
			{/* ID Badge */}
			<div className='mb-4 flex justify-between items-start'>
				<div className='w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-xl border border-amber-200'>
					{initial}
				</div>
				<span className='text-[10px] font-mono text-gray-400 bg-muted px-2 py-1 rounded'>
					ID: {campaign.id.slice(0, 8)}...
				</span>
			</div>

			<div className='flex-1 mb-6'>
				<h3 className='text-xl font-bold text-foreground font-serif mb-2'>{campaign.name}</h3>
				<p className='text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed italic'>
					{campaign.description || 'A journey into the unknown.'}
				</p>

				{/* Characters Section */}
				{campaign.characterNames?.length > 0 && (
					<div className='pt-4 border-t border-border/50'>
						<div className='flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2'>
							<Users size={12} />
							Party Members
						</div>
						<div className='flex flex-wrap gap-1'>
							{campaign.characterNames
								.filter((name) => name !== 'Party')
								.map((name, i) => (
									<span
										key={i}
										className='text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100'>
										{name}
									</span>
								))}
						</div>
					</div>
				)}
			</div>

			<div className='mt-auto'>
				<Button onClick={() => onSelect(campaign.id)} fullWidth variant='primary' icon={ArrowRight}>
					Enter Campaign
				</Button>
			</div>
		</div>
	);
};
