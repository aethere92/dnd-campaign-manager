import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getDashboardData } from '@/features/dashboard/api/dashboardService';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { SectionDivider } from '@/shared/components/ui/SectionDivider';

import { CampaignHeader } from './components/CampaignHeader';
import { CurrentArcMetadata } from './components/CurrentArcMetadata';
import { CurrentStoryStack } from './components/CurrentStoryStack';
import { ArchiveTree } from './components/ArchiveTree';
import { InsightsGrid } from './components/InsightsGrid';
import { PartyWidget } from './components/PartyWidget';
import { ActiveThreads } from './components/ActiveThreads';

export default function DashboardView() {
	const { campaignId } = useCampaign();

	const { data, isLoading } = useQuery({
		queryKey: ['dashboard_final', campaignId],
		queryFn: () => getDashboardData(campaignId),
		enabled: !!campaignId,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) return <LoadingSpinner className={`h-full min-h-[50vh]`} text='Opening chronicle...' fullScreen />;

	const { campaign, counts, currentArc, otherArcs, activeParty, activeThreads, stats } = data || {};

	const currentSessions = currentArc?.sessions || [];
	const latestSession = currentArc?.latestSession;
	const otherCurrentSessions = currentSessions.filter((s) => s.id !== latestSession?.id);

	return (
		<div className='h-full overflow-y-auto bg-background custom-scrollbar'>
			<div className='p-6 pb-12'>
				<div className='max-w-[1600px] mx-auto space-y-12'>
					{/* ROW 1: Campaign Hero */}
					<div className='w-full'>
						<CampaignHeader campaign={campaign} counts={counts} />
					</div>

					{/* ROW 2: Main Story Area */}
					<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch lg:min-h-[600px]'>
						{/* Left: Metadata */}
						<div className='lg:col-span-3'>
							<CurrentArcMetadata arc={currentArc?.data} />
						</div>

						{/* Middle: Unified Story Stack */}
						<div className='lg:col-span-6'>
							<CurrentStoryStack latestSession={latestSession} previousSessions={otherCurrentSessions} />
						</div>

						{/* Right: Archive */}
						<div className='lg:col-span-3'>
							<ArchiveTree arcs={otherArcs} />
						</div>
					</div>

					<SectionDivider className='my-6' />

					{/* ROW 3: Active Party */}
					<div>
						<PartyWidget party={activeParty} />
					</div>

					<SectionDivider className='my-6' />

					{/* ROW 4: Status Panel (Insights & Threads) */}
					<div className='bg-card/30 border border-border rounded-xl p-8 relative overflow-hidden min-h-[400px]'>
						<div
							className='absolute inset-0 opacity-[0.03] pointer-events-none'
							style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
						/>

						<div className='grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 h-full'>
							{/* Insights - Expanded to 8 columns */}
							<div className='lg:col-span-8 h-full'>
								<InsightsGrid stats={stats} counts={counts} />
							</div>

							{/* Threads - 4 columns */}
							<div className='lg:col-span-4 h-full sm:border-l sm:border-border/50 sm:pl-8'>
								<ActiveThreads quests={activeThreads} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
