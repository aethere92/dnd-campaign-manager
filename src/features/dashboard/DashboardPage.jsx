import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getDashboardData } from '@/features/dashboard/api/dashboardService';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { CampaignHero } from './components/CampaignHero';
import { LatestSessionCard } from './components/LatestSessionCard';
import { RecentSessionsList } from './components/RecentSessionsList';
import { QuickInsights } from './components/QuickInsights';
import { ActiveQuestsWidget } from './components/ActiveQuestsWidget';
import { RecentEncountersWidget } from './components/RecentEncountersWidget';

export default function DashboardView() {
	const { campaignId } = useCampaign();

	const { data, isLoading } = useQuery({
		queryKey: ['dashboard', campaignId],
		queryFn: () => getDashboardData(campaignId),
		enabled: !!campaignId,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center bg-background'>
				<LoadingSpinner text='Loading campaign overview...' size='lg' />
			</div>
		);
	}

	const { campaign, sessions, stats, activeQuests, recentEncounters } = data || {};
	const latestSession = sessions?.[0];
	const olderSessions = sessions?.slice(1, 4) || [];

	return (
		<div className='h-full overflow-y-auto bg-background custom-scrollbar'>
			{/* Hero Section */}
			<CampaignHero campaign={campaign} stats={stats} />

			{/* Main Content Grid */}
			<div className='max-w-[1600px] mx-auto px-4 sm:px-6 pb-12'>
				{/* Latest Session - Full Width Feature */}
				{latestSession && (
					<div className='mb-8 -mt-10 relative z-10'>
						<LatestSessionCard session={latestSession} />
					</div>
				)}

				{/* Two Column Layout */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
					{/* Left Column - Recent Sessions & Insights */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Quick Insights */}
						<QuickInsights stats={stats} sessions={sessions} />

						{/* Recent Sessions */}
						{olderSessions.length > 0 && <RecentSessionsList sessions={olderSessions} />}
					</div>

					{/* Right Column - Widgets */}
					<div className='space-y-6'>
						{/* Active Quests */}
						{activeQuests && activeQuests.length > 0 && <ActiveQuestsWidget quests={activeQuests} />}

						{/* Recent Encounters */}
						{recentEncounters && recentEncounters.length > 0 && (
							<RecentEncountersWidget encounters={recentEncounters} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
