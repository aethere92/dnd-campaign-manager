import { Trophy, Map, Users, Swords, Skull, Crown } from 'lucide-react';

export const InsightsGrid = ({ stats, counts }) => {
	// Helper to safely get data
	const getVal = (obj, key) => obj?.[key];

	const insights = [
		{
			label: 'Most Active Session',
			value: getVal(stats?.most_active_session, 'title'),
			sub: `${getVal(stats?.most_active_session, 'event_count') || 0} Events`,
			icon: Trophy,
			color: 'text-yellow-500',
		},
		{
			label: 'Top Location',
			value: getVal(stats?.top_location, 'name'),
			sub: `${getVal(stats?.top_location, 'visits') || 0} Visits`,
			icon: Map,
			color: 'text-emerald-500',
		},
		{
			label: 'Most Met NPC',
			value: getVal(stats?.top_npc, 'name'),
			sub: `${getVal(stats?.top_npc, 'mentions') || 0} Mentions`,
			icon: Users,
			color: 'text-blue-500',
		},
		{
			label: 'Campaign Duration',
			value: `${counts?.sessions || 0} Sessions`,
			sub: 'Total Playtime',
			icon: Crown,
			color: 'text-purple-500',
		},
		{
			label: 'Battles Fought',
			value: stats?.total_encounters || 0,
			sub: 'Total Encounters',
			icon: Swords,
			color: 'text-red-500',
		},
	];

	return (
		<div className='h-full'>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2'>
				Campaign Insights
			</h4>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8'>
				{insights.map((item, idx) => (
					<div key={idx} className='flex items-start gap-4 group'>
						<div className={`mt-1 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors ${item.color}`}>
							<item.icon size={18} />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='text-xl font-serif font-bold text-foreground truncate leading-none mb-1'>
								{item.value || 'N/A'}
							</p>
							<p className='text-[10px] font-bold uppercase text-muted-foreground/60'>{item.label}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
