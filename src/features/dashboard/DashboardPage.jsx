import { useQuery } from '@tanstack/react-query';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getDashboardData } from '@/features/dashboard/api/dashboardService';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { getEntityColor } from '@/domain/entity/config/entityConfig';

import './dashboard.css';
import { HeroChronicle } from './components/redesign/HeroChronicle';
import { Section } from './components/redesign/Section';
import { FellowshipRoster } from './components/redesign/FellowshipRoster';
import { StoryTimeline } from './components/redesign/StoryTimeline';
import { CurrentStage } from './components/redesign/CurrentStage';
import { LivingWorld } from './components/redesign/LivingWorld';

// Each section gets its own colour "biome" so it reads as its own world and the
// tint bleeds across the whole content area. Drawn from the entity palette:
// party = quest-blue, story = npc-amber, stage = location-green, lore = faction-purple.
const BIOME = {
	fellowship: getEntityColor('quest'),
	story: getEntityColor('npc'),
	stage: getEntityColor('location'),
	lore: getEntityColor('faction'),
};

/**
 * The campaign landing page — an immersive "chronicle" rather than a data dump.
 *
 * Reading order: where were we (hero + recap) → who are we (fellowship) → the
 * arc (story) → where we stand (stage) → what's unresolved (living world).
 * Renders inside MainLayout's content slot beside the sidebar, owns its own
 * scroll, and each section is full-bleed within that area. No 100svh — the
 * mobile shell has a sticky header.
 */
export default function DashboardPage() {
	const { campaignId } = useCampaign();

	const { data, isLoading } = useQuery({
		queryKey: ['dashboard_redesign', campaignId],
		queryFn: () => getDashboardData(campaignId),
		enabled: !!campaignId,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return <LoadingSpinner className='h-full min-h-[50vh]' text='Opening chronicle...' />;
	}

	const { campaign, counts, currentArc, otherArcs, activeParty, activeThreads, currentRegion, recentEntities } =
		data || {};

	return (
		<div className='h-full overflow-y-auto overflow-x-hidden bg-background custom-scrollbar pb-16'>
			{/* full-width sections; each centers its own content */}
			<HeroChronicle campaign={campaign} counts={counts} latestArc={currentArc} currentRegion={currentRegion} />

			{activeParty?.length > 0 && (
				<Section biome={BIOME.fellowship}>
					<FellowshipRoster party={activeParty} />
				</Section>
			)}

			{(currentArc?.data || currentArc?.sessions?.length > 0) && (
				<Section biome={BIOME.story}>
					<StoryTimeline currentArc={currentArc} otherArcs={otherArcs} />
				</Section>
			)}

			{currentRegion && (
				<Section biome={BIOME.stage}>
					<CurrentStage location={currentRegion} />
				</Section>
			)}

			{(activeThreads?.length > 0 || recentEntities?.length > 0) && (
				<Section biome={BIOME.lore}>
					<LivingWorld threads={activeThreads} recentEntities={recentEntities} />
				</Section>
			)}
		</div>
	);
}
