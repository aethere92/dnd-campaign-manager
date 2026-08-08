import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getDashboardData } from '@/features/dashboard/api/dashboardService';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { SectionDivider } from '@/shared/components/ui/SectionDivider';

import { CampaignHeader } from './components/CampaignHeader';
import { CurrentArcMetadata } from './components/CurrentArcMetadata';
import { CurrentStoryStack } from './components/CurrentStoryStack';
import { ArchiveTree } from './components/ArchiveTree';
import { PartyWidget } from './components/PartyWidget';

// New Components
import { CurrentRegion } from './components/CurrentRegion';
import { UnresolvedThreads } from './components/UnresolvedThreads';
import { RecentDiscoveries } from './components/RecentDiscoveries';

export default function DashboardPage() {
	const { campaignId } = useCampaign();

	const { data, isLoading } = useQuery({
		queryKey: ['dashboard_final', campaignId],
		queryFn: () => getDashboardData(campaignId),
		enabled: !!campaignId,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) return <LoadingSpinner className={`h-full min-h-[50vh]`} text='Opening chronicle...' fullScreen />;

	const { campaign, counts, currentArc, otherArcs, activeParty, activeThreads, currentRegion, recentEntities } =
		data || {};

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
					<PartyWidget party={activeParty} />

					<SectionDivider className='my-6' />

					{/* ROW 4: The Stage (Current Region) */}
					{currentRegion && (
						<div className='w-full'>
							<CurrentRegion location={currentRegion} />
						</div>
					)}

					{/* ROW 5: The Lore (Mysteries & Discoveries) */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						<div className='w-full'>
							<UnresolvedThreads threads={activeThreads} />
						</div>
						<div className='w-full'>
							<RecentDiscoveries entities={recentEntities} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
