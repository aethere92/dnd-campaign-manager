import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { routePatterns } from '@/app/routes';
import { RouteLoading } from './components/RouteLoading';
import { CampaignScope, CampaignRedirect } from './components/CampaignScope';
import { LegacyRedirect, LegacyWikiRedirect } from './components/LegacyRedirect';
import { NotFound } from './components/NotFound';
import { DmGuard } from './components/DmGuard';

const CampaignSelect = lazy(() => import('@/features/campaign/components/CampaignSelect'));
const MainLayout = lazy(() => import('@/features/navigation/MainLayout'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const MapPage = lazy(() => import('@/features/atlas/MapPage'));
const AtlasDefaultRedirect = lazy(() => import('@/features/atlas/AtlasDefaultRedirect'));
const TimelinePage = lazy(() => import('@/features/timeline/TimelinePage'));
const GraphPage = lazy(() => import('@/features/graph/GraphPage'));
const WikiLayout = lazy(() => import('@/features/wiki/WikiLayout'));
const WikiDetailPage = lazy(() => import('@/features/wiki/pages/WikiDetailPage'));
const WikiLandingPage = lazy(() => import('@/features/wiki/pages/WikiLandingPage'));

// Admin Features
const AdminLayout = lazy(() => import('@/features/admin/layouts/AdminLayout'));
const SplitPaneManager = lazy(() => import('@/features/admin/pages/SplitPaneManager'));
const BulkReplaceTool = lazy(() => import('@/features/admin/pages/BulkReplaceTool'));
const MapMigrationTool = lazy(() => import('@/features/admin/pages/MapMigrationTool'));
const MapManagerPage = lazy(() => import('@/features/admin/pages/MapManagerPage'));
const DmLogin = lazy(() => import('@/features/admin/pages/DmLogin'));

/**
 * The route table is a single fixed tree.
 *
 * It deliberately does NOT branch on whether a campaign is loaded. The previous
 * version rendered one of two different route sets depending on `campaignId`,
 * which made the router's shape a function of fetched data; a hard refresh of a
 * deep link could then resolve against the "no campaign" tree and redirect away,
 * losing the requested URL. Guarding happens inside <CampaignScope> instead, so
 * the tree is stable and only the *element* varies.
 */
export const AppRoutes = () => {
	return (
		<Suspense fallback={<RouteLoading text='Loading Application...' />}>
			<Routes>
				{/* DM login — public: it's how you get a password into the session. */}
				<Route path='/dm/login' element={<DmLogin />} />

				{/* Admin console — not campaign-scoped; it has its own switcher.
				    Gated by <DmGuard> (redirects to login if no password in session).
				    That gate is UX only — the database enforces writes via
				    check_dm_password() no matter what renders — but it now works in
				    production, replacing the old dev-only `isDev` flag. */}
				<Route element={<DmGuard />}>
					<Route path='/dm' element={<AdminLayout />}>
						<Route index element={<SplitPaneManager />} />
						<Route path='manage/:type/:id?' element={<SplitPaneManager />} />
						<Route path='tools/replace' element={<BulkReplaceTool />} />
						<Route path='tools/migration' element={<MapMigrationTool />} />
						<Route path='tools/atlas' element={<MapManagerPage />} />
						<Route path='*' element={<NotFound title='Unknown admin page' />} />
					</Route>
				</Route>

				<Route path='/select-campaign' element={<CampaignSelect />} />

				{/* Campaign-scoped application */}
				<Route path={routePatterns.campaignScope} element={<CampaignScope />}>
					<Route element={<MainLayout />}>
						<Route index element={<DashboardPage />} />

						<Route path={routePatterns.atlas} element={<AtlasDefaultRedirect />} />
						<Route path={routePatterns.atlasMap} element={<MapPage />} />
						<Route path={routePatterns.timeline} element={<TimelinePage />} />
						<Route path={routePatterns.relationships} element={<GraphPage />} />

						<Route path={routePatterns.wikiType} element={<WikiLayout />}>
							<Route index element={<WikiLandingPage />} />
							<Route path={routePatterns.wikiEntity} element={<WikiDetailPage />} />
						</Route>

						{/* A real 404, not a silent bounce to the dashboard. */}
						<Route path='*' element={<NotFound />} />
					</Route>
				</Route>

				{/* Bare root: resume the last-used campaign, else pick one. */}
				<Route path='/' element={<CampaignRedirect />} />

				{/* Legacy unscoped URLs from before the campaign was in the path. */}
				<Route path='/wiki/:type/:entityId?' element={<LegacyWikiRedirect />} />
				<Route path='/atlas/*' element={<LegacyRedirect />} />
				<Route path='/timeline' element={<LegacyRedirect />} />
				<Route path='/relationships' element={<LegacyRedirect />} />

				<Route path='*' element={<NotFound />} />
			</Routes>
		</Suspense>
	);
};
