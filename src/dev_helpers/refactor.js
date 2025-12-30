import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MAPPING: [Source Path] -> [Destination Path]
 */
const moveMap = {
	// APP CORE
	'main.jsx': 'src/main.jsx',
	'index.css': 'src/app/styles/global.css',
	'features/app-core/App.jsx': 'src/app/App.jsx',
	'features/app-core/AppRoutes.jsx': 'src/app/AppRoutes.jsx',
	'features/app-core/components/RouteLoading.jsx': 'src/app/components/RouteLoading.jsx',

	// DOMAIN - ENTITY (Shared Logic)
	'config/entity/colors.js': 'src/domain/entity/config/entityColors.js',
	'config/entity/entityConfig.js': 'src/domain/entity/config/entityConfig.js',
	'config/entity/icons.js': 'src/domain/entity/config/entityIcons.js',
	'config/entity/styles.js': 'src/domain/entity/config/entityStyles.js',
	'config/entity/types.js': 'src/domain/entity/config/entityTypes.js',
	'utils/entity/attributeParser.js': 'src/domain/entity/utils/attributeParser.js',
	'utils/entity/entityHelpers.js': 'src/domain/entity/utils/entityUtils.js',
	'utils/status/statusHelpers.js': 'src/domain/entity/utils/statusUtils.js',
	'components/entity/EntityBadge.jsx': 'src/domain/entity/components/EntityBadge.jsx',
	'components/entity/EntityIcon.jsx': 'src/domain/entity/components/EntityIcon.jsx',
	'components/entity/EntityLink.jsx': 'src/domain/entity/components/EntityLink.jsx',
	'components/entity/EntityStatusIcon.jsx': 'src/domain/entity/components/EntityStatusIcon.jsx',
	'services/entities.js': 'src/domain/entity/api/entityService.js',

	// SHARED - GENERIC UI
	'components/ErrorBoundary.jsx': 'src/shared/components/ErrorBoundary.jsx',
	'components/ui/Breadcrumbs.jsx': 'src/shared/components/ui/Breadcrumbs.jsx',
	'components/ui/Button.jsx': 'src/shared/components/ui/Button.jsx',
	'components/ui/Card.jsx': 'src/shared/components/ui/Card.jsx',
	'components/ui/DevAdminButton.jsx': 'src/shared/components/ui/DevAdminButton.jsx',
	'components/ui/Drawer.jsx': 'src/shared/components/ui/Drawer.jsx',
	'components/ui/EmptyState.jsx': 'src/shared/components/ui/EmptyState.jsx',
	'components/ui/LoadingSpinner.jsx': 'src/shared/components/ui/LoadingSpinner.jsx',
	'components/ui/SectionDivider.jsx': 'src/shared/components/ui/SectionDivider.jsx',
	'components/layout/SplitView.jsx': 'src/shared/components/layout/SplitView.jsx',
	'components/layout/TabContainer.jsx': 'src/shared/components/layout/TabContainer.jsx',
	'components/layout/CollapsibleSection.jsx': 'src/shared/components/layout/CollapsibleSection.jsx',
	'components/markdown/MarkdownRenderer.jsx': 'src/shared/components/markdown/MarkdownRenderer.jsx',
	'components/markdown/MarkdownWithToC.jsx': 'src/shared/components/markdown/MarkdownWithToC.jsx',

	// SHARED - UTILS & HOOKS
	'lib/supabase.js': 'src/shared/api/supabaseClient.js',
	'hooks/useTheme.js': 'src/shared/hooks/useTheme.js',
	'features/hooks/useBreadcrumbs.js': 'src/shared/hooks/useBreadcrumbs.js',
	'utils/image/imageResolver.js': 'src/shared/utils/imageUtils.js',
	'utils/text/textProcessing.js': 'src/shared/utils/textUtils.js',
	'utils/text/markdownHelpers.js': 'src/shared/utils/markdownUtils.js',
	'utils/theme/colorHelpers.js': 'src/shared/utils/theme/colorUtils.js',
	'utils/theme/cssVariables.js': 'src/shared/utils/theme/cssUtils.js',

	// FEATURES - ADMIN
	'services/admin.js': 'src/features/admin/api/adminService.js',
	'features/admin-console/config/strategies.js': 'src/features/admin/config/adminStrategies.js',
	'features/admin-console/layouts/AdminLayout.jsx': 'src/features/admin/layouts/AdminLayout.jsx',
	'features/admin-console/pages/EntityEditorPage.jsx': 'src/features/admin/pages/EntityEditorPage.jsx',
	'features/admin-console/pages/EntityListPage.jsx': 'src/features/admin/pages/EntityListPage.jsx',
	'features/admin-console/pages/SplitPaneManager.jsx': 'src/features/admin/pages/SplitPaneManager.jsx',
	'features/admin-console/components/AdminForm.jsx': 'src/features/admin/components/AdminForm.jsx',
	'features/admin-console/components/EncounterActionManager.jsx':
		'src/features/admin/components/EncounterActionManager.jsx',
	'features/admin-console/components/EntitySearch.jsx': 'src/features/admin/components/EntitySearch.jsx',
	'features/admin-console/components/EventTagger.jsx': 'src/features/admin/components/EventTagger.jsx',
	'features/admin-console/components/MarkdownEditor.jsx': 'src/features/admin/components/MarkdownEditor.jsx',
	'features/admin-console/components/QuestObjectiveManager.jsx':
		'src/features/admin/components/QuestObjectiveManager.jsx',
	'features/admin-console/components/RelationshipManager.jsx': 'src/features/admin/components/RelationshipManager.jsx',
	'features/admin-console/components/SessionEventManager.jsx': 'src/features/admin/components/SessionEventManager.jsx',
	'features/admin-console/components/SmartImageInput.jsx': 'src/features/admin/components/SmartImageInput.jsx',
	'features/admin-console/components/ui/FormStyles.js': 'src/features/admin/components/AdminFormStyles.js',

	// FEATURES - ATLAS (MAP)
	'features/world-map/MapView.jsx': 'src/features/atlas/MapPage.jsx',
	'features/world-map/useMapData.js': 'src/features/atlas/useMapData.js',
	'features/world-map/mapConfig.js': 'src/features/atlas/config/mapConfig.js',
	'features/world-map/utils/mapNavigation.js': 'src/features/atlas/utils/mapNavigation.js',
	'features/world-map/utils/markerUtils.js': 'src/features/atlas/utils/markerUtils.js',
	'features/world-map/components/MapCanvas.jsx': 'src/features/atlas/components/MapCanvas.jsx',
	'features/world-map/components/MapLayerControl.jsx': 'src/features/atlas/components/MapLayerControl.jsx',
	'features/world-map/components/useMapCanvasViewModel.js': 'src/features/atlas/components/useMapCanvasViewModel.js',
	'features/world-map/components/layers/MapAreas.jsx': 'src/features/atlas/components/layers/MapAreas.jsx',
	'features/world-map/components/layers/MapMarkers.jsx': 'src/features/atlas/components/layers/MapMarkers.jsx',
	'features/world-map/components/layers/MapOverlays.jsx': 'src/features/atlas/components/layers/MapOverlays.jsx',
	'features/world-map/components/layers/MapRecaps.jsx': 'src/features/atlas/components/layers/MapRecaps.jsx',

	// FEATURES - DASHBOARD
	'services/dashboard.js': 'src/features/dashboard/api/dashboardService.js',
	'features/dashboard/DashboardView.jsx': 'src/features/dashboard/DashboardPage.jsx',
	'features/dashboard/components/ActiveQuestsWidget.jsx': 'src/features/dashboard/components/ActiveQuestsWidget.jsx',
	'features/dashboard/components/CampaignHero.jsx': 'src/features/dashboard/components/CampaignHero.jsx',
	'features/dashboard/components/LatestSessionCard.jsx': 'src/features/dashboard/components/LatestSessionCard.jsx',
	'features/dashboard/components/QuickInsights.jsx': 'src/features/dashboard/components/QuickInsights.jsx',
	'features/dashboard/components/RecentEncountersWidget.jsx':
		'src/features/dashboard/components/RecentEncountersWidget.jsx',
	'features/dashboard/components/RecentSessionsList.jsx': 'src/features/dashboard/components/RecentSessionsList.jsx',
	'features/dashboard/components/SessionRecapCard.jsx': 'src/features/dashboard/components/SessionRecapCard.jsx',

	// FEATURES - WIKI (Merged)
	'services/wiki.js': 'src/features/wiki/api/wikiService.js',
	'features/entity-view/WikiEntityView.jsx': 'src/features/wiki/components/WikiEntryView.jsx',
	'features/entity-view/useEntityViewModel.js': 'src/features/wiki/useEntityView.js',
	'features/entity-view/components/EncounterTimeline.jsx': 'src/features/wiki/components/EncounterTimeline.jsx',
	'features/entity-view/components/EntityBody.jsx': 'src/features/wiki/components/EntityBody.jsx',
	'features/entity-view/components/EntityHeader.jsx': 'src/features/wiki/components/EntityHeader.jsx',
	'features/entity-view/components/EntityHistory.jsx': 'src/features/wiki/components/EntityHistory.jsx',
	'features/entity-view/components/EntitySidebar.jsx': 'src/features/wiki/components/EntitySidebar.jsx',
	'features/entity-view/components/QuestObjectives.jsx': 'src/features/wiki/components/QuestObjectives.jsx',
	'features/entity-view/components/SessionMentions.jsx': 'src/features/wiki/components/SessionMentions.jsx',
	'features/entity-view/components/landing/EntityGridCard.jsx':
		'src/features/wiki/components/landing/EntityGridCard.jsx',
	'features/entity-view/components/landing/Swimlane.jsx': 'src/features/wiki/components/landing/Swimlane.jsx',
	'features/entity-view/hooks/useEntityContent.js': 'src/features/wiki/hooks/useEntityContent.js',
	'features/entity-view/hooks/useEntityHeader.js': 'src/features/wiki/hooks/useEntityHeader.js',
	'features/entity-view/hooks/useEntitySidebar.js': 'src/features/wiki/hooks/useEntitySidebar.js',
	'features/entity-view/layouts/SessionLayout.jsx': 'src/features/wiki/layouts/SessionLayout.jsx',
	'features/entity-view/layouts/StandardLayout.jsx': 'src/features/wiki/layouts/StandardLayout.jsx',
	'features/entity-view/pages/WikiEntryPage.jsx': 'src/features/wiki/pages/WikiDetailPage.jsx',
	'features/entity-view/pages/WikiLandingPage.jsx': 'src/features/wiki/pages/WikiLandingPage.jsx',
	'features/entity-view/config/viewStrategies.js': 'src/features/wiki/config/viewStrategies.js',
	'features/entity-view/transforms/attributeTransform.js': 'src/features/wiki/utils/attributeMapper.js',
	'features/entity-view/transforms/eventTransform.js': 'src/features/wiki/utils/eventMapper.js',
	'features/entity-view/transforms/relationshipTransform.js': 'src/features/wiki/utils/relationshipMapper.js',
	'features/entity-view/transforms/wikiEntryTransform.js': 'src/features/wiki/utils/wikiEntryMapper.js',

	// WIKI NAVIGATION (Moved from wiki-layout)
	'features/wiki-layout/WikiLayout.jsx': 'src/features/wiki/WikiLayout.jsx',
	'features/wiki-layout/useWikiNavigation.js': 'src/features/wiki/useWikiNavigation.js',
	'features/wiki-layout/hooks/useEntityFetching.js': 'src/features/wiki/hooks/useEntityFetching.js',
	'features/wiki-layout/hooks/useEntityGrouping.js': 'src/features/wiki/hooks/useEntityGrouping.js',
	'features/wiki-layout/config/groupingConfig.js': 'src/features/wiki/config/groupingConfig.js',
	'features/wiki-layout/transforms/entityTransforms.js': 'src/features/wiki/utils/wikiUtils.js',
	'features/wiki-layout/components/WikiSidebar.jsx': 'src/features/wiki/components/navigation/WikiSidebar.jsx',
	'features/wiki-layout/components/WikiSidebarHeader.jsx':
		'src/features/wiki/components/navigation/WikiSidebarHeader.jsx',
	'features/wiki-layout/components/WikiSidebarList.jsx': 'src/features/wiki/components/navigation/WikiSidebarList.jsx',
	'features/wiki-layout/components/SidebarEmptyState.jsx':
		'src/features/wiki/components/navigation/SidebarEmptyState.jsx',
	'features/wiki-layout/components/sidebar/CollapsibleGroup.jsx':
		'src/features/wiki/components/navigation/sidebar/CollapsibleGroup.jsx',
	'features/wiki-layout/components/sidebar/EntityListItem.jsx':
		'src/features/wiki/components/navigation/sidebar/EntityListItem.jsx',
	'features/wiki-layout/components/sidebar/PriorityIcon.jsx':
		'src/features/wiki/components/navigation/sidebar/PriorityIcon.jsx',
	'features/wiki-layout/components/sidebar/SidebarTreeItem.jsx':
		'src/features/wiki/components/navigation/sidebar/SidebarTreeItem.jsx',
	'features/wiki-layout/components/sidebar/StatusIcon.jsx':
		'src/features/wiki/components/navigation/sidebar/StatusIcon.jsx',

	// FEATURES - CAMPAIGN
	'services/campaigns.js': 'src/features/campaign/api/campaignService.js',
	'features/campaign-session/CampaignContext.jsx': 'src/features/campaign/CampaignContext.jsx',
	'features/campaign-session/useCampaignPersistence.js': 'src/features/campaign/useCampaignPersistence.js',
	'features/campaign-session/useCampaignSelection.js': 'src/features/campaign/useCampaignSelection.js',
	'features/campaign-session/components/CampaignCard.jsx': 'src/features/campaign/components/CampaignCard.jsx',
	'features/campaign-session/components/CampaignSelect.jsx': 'src/features/campaign/components/CampaignSelect.jsx',

	// FEATURES - SEARCH
	'services/search.js': 'src/features/search/api/searchService.js',
	'features/global-search/GlobalSearch.jsx': 'src/features/search/GlobalSearch.jsx',
	'features/global-search/SearchContext.jsx': 'src/features/search/SearchContext.jsx',
	'features/global-search/useGlobalSearchViewModel.js': 'src/features/search/useGlobalSearch.js',
	'features/global-search/components/SearchFooter.jsx': 'src/features/search/components/SearchFooter.jsx',
	'features/global-search/components/SearchModal.jsx': 'src/features/search/components/SearchModal.jsx',
	'features/global-search/components/SearchResultItem.jsx': 'src/features/search/components/SearchResultItem.jsx',
	'features/global-search/components/SearchResults.jsx': 'src/features/search/components/SearchResults.jsx',
	'features/global-search/components/SearchTrigger.jsx': 'src/features/search/components/SearchTrigger.jsx',
	'features/global-search/transforms/searchTransform.js': 'src/features/search/utils/searchMapper.js',

	// FEATURES - GRAPH
	'services/graph.js': 'src/features/graph/api/graphService.js',
	'features/relationship-graph/RelationshipGraph.jsx': 'src/features/graph/GraphPage.jsx',
	'features/relationship-graph/useGraphViewModel.js': 'src/features/graph/useGraphView.js',
	'features/relationship-graph/components/CytoscapeCanvas.jsx': 'src/features/graph/components/CytoscapeCanvas.jsx',
	'features/relationship-graph/components/GraphLegend.jsx': 'src/features/graph/components/GraphLegend.jsx',
	'features/relationship-graph/config/graphStyles.js': 'src/features/graph/config/graphStyles.js',
	'features/relationship-graph/transforms/graphTransform.js': 'src/features/graph/utils/graphMapper.js',

	// FEATURES - TIMELINE
	'services/timeline.js': 'src/features/timeline/api/timelineService.js',
	'features/timeline/TimelineView.jsx': 'src/features/timeline/TimelinePage.jsx',
	'features/timeline/useTimelineViewModel.js': 'src/features/timeline/useTimelineView.js',
	'features/timeline/components/TimelineEvent.jsx': 'src/features/timeline/components/TimelineEvent.jsx',
	'features/timeline/components/TimelineSession.jsx': 'src/features/timeline/components/TimelineSession.jsx',
	'features/timeline/utils/eventStyles.js': 'src/features/timeline/utils/eventStyles.js',

	// FEATURES - SMART TEXT & TOOLTIP
	'features/smart-text/SmartMarkdown.jsx': 'src/features/smart-text/SmartMarkdown.jsx',
	'features/smart-text/useSmartText.js': 'src/features/smart-text/useSmartText.js',
	'features/smart-text/useEntityIndex.js': 'src/features/smart-text/useEntityIndex.js',
	'features/smart-text/components/EntityEmbed.jsx': 'src/features/smart-text/components/EntityEmbed.jsx',
	'features/smart-text/components/SmartEntityLink.jsx': 'src/features/smart-text/components/SmartEntityLink.jsx',
	'features/smart-tooltip/TooltipContainer.jsx': 'src/features/smart-tooltip/TooltipContainer.jsx',
	'features/smart-tooltip/TooltipContext.jsx': 'src/features/smart-tooltip/TooltipContext.jsx',
	'features/smart-tooltip/useSmartPosition.js': 'src/features/smart-tooltip/useSmartPosition.js',
	'features/smart-tooltip/useTooltipState.js': 'src/features/smart-tooltip/useTooltipState.js',
	'features/smart-tooltip/components/TooltipCard.jsx': 'src/features/smart-tooltip/components/TooltipCard.jsx',

	// FEATURES - TOC & NAVIGATION
	'features/table-of-contents/TableOfContents.jsx': 'src/features/table-of-contents/TableOfContents.jsx',
	'features/table-of-contents/components/TocItem.jsx': 'src/features/table-of-contents/components/TocItem.jsx',
	'features/table-of-contents/components/TocMobileDrawer.jsx':
		'src/features/table-of-contents/components/TocMobileDrawer.jsx',
	'features/table-of-contents/hooks/useTocObserver.js': 'src/features/table-of-contents/hooks/useTocObserver.js',
	'features/table-of-contents/hooks/useTocScroll.js': 'src/features/table-of-contents/hooks/useTocScroll.js',
	'features/layout-main/MainLayout.jsx': 'src/features/navigation/MainLayout.jsx',
	'features/layout-main/useMainLayout.js': 'src/features/navigation/useNavigation.js',
	'features/layout-main/navConfig.js': 'src/features/navigation/config/navConfig.js',
	'features/layout-main/components/Sidebar.jsx': 'src/features/navigation/components/Sidebar.jsx',
	'features/layout-main/components/SidebarFooter.jsx': 'src/features/navigation/components/SidebarFooter.jsx',
	'features/layout-main/components/SidebarHeader.jsx': 'src/features/navigation/components/SidebarHeader.jsx',
	'features/layout-main/components/SidebarNav.jsx': 'src/features/navigation/components/SidebarNav.jsx',
};

/**
 * EXECUTION LOGIC
 */
async function refactor() {
	console.log('🚀 Starting 2025 Architecture Refactor (ESM Mode)...');

	for (const [oldPath, newPath] of Object.entries(moveMap)) {
		const source = path.resolve(__dirname, oldPath);
		const destination = path.resolve(__dirname, newPath);

		if (fs.existsSync(source)) {
			// Create directory for destination if it doesn't exist
			const destDir = path.dirname(destination);
			if (!fs.existsSync(destDir)) {
				fs.mkdirSync(destDir, { recursive: true });
			}

			// Move file
			try {
				fs.renameSync(source, destination);
				console.log(`✅ Moved: ${oldPath} -> ${newPath}`);
			} catch (err) {
				console.error(`❌ Error moving ${oldPath}:`, err.message);
			}
		} else {
			console.warn(`⚠️  Source not found (skipping): ${oldPath}`);
		}
	}

	console.log('\n✨ Refactor Complete!');
}

refactor();
