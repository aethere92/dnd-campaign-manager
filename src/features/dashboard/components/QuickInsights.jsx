import { TrendingUp, Trophy, Map, Users } from 'lucide-react';
import { clsx } from 'clsx';

export const QuickInsights = ({ stats, sessions }) => {
	const insights = [
		{
			icon: TrendingUp,
			label: 'Most Active Session',
			value: stats?.mostActiveSession?.title || 'N/A',
			subtitle: `${stats?.mostActiveSession?.eventCount || 0} events`,
			color: 'text-blue-600',
			bg: 'bg-blue-500/10',
			border: 'border-blue-500/30',
		},
		{
			icon: Map,
			label: 'Most Visited Location',
			value: stats?.topLocation?.name || 'N/A',
			subtitle: `${stats?.topLocation?.visits || 0} visits`,
			color: 'text-emerald-600',
			bg: 'bg-emerald-500/10',
			border: 'border-emerald-500/30',
		},
		{
			icon: Users,
			label: 'Most Encountered NPC',
			value: stats?.topNPC?.name || 'N/A',
			subtitle: `${stats?.topNPC?.mentions || 0} mentions`,
			color: 'text-amber-600',
			bg: 'bg-amber-500/10',
			border: 'border-amber-500/30',
		},
		{
			icon: Trophy,
			label: 'Quests Completed',
			value: stats?.completedQuests || 0,
			subtitle: `${stats?.activeQuests || 0} still active`,
			color: 'text-purple-600',
			bg: 'bg-purple-500/10',
			border: 'border-purple-500/30',
		},
	];

	return (
		<div>
			<h2 className='text-xl font-serif font-bold text-foreground mb-4'>Campaign Insights</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{insights.map((insight, idx) => {
					const Icon = insight.icon;
					return (
						<div
							key={idx}
							className={clsx('bg-background border rounded-lg p-4 hover:shadow-md transition-all', insight.border)}>
							<div className='flex items-start gap-3'>
								<div className={clsx('p-2 rounded-lg shrink-0', insight.bg)}>
									<Icon size={20} className={insight.color} strokeWidth={2.5} />
								</div>
								<div className='flex-1 min-w-0'>
									<p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1'>
										{insight.label}
									</p>
									<p className='text-lg font-serif font-bold text-foreground truncate mb-0.5'>{insight.value}</p>
									<p className='text-xs text-muted-foreground'>{insight.subtitle}</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
