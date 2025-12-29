import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { RouteLoading } from './components/RouteLoading';

const CampaignSelect = lazy(() => import('../../features/campaign-session/components/CampaignSelect'));
const MainLayout = lazy(() => import('../../features/layout-main/MainLayout'));
const DashboardView = lazy(() => import('../../features/dashboard/DashboardView'));
const MapView = lazy(() => import('../../features/world-map/MapView'));
const TimelineView = lazy(() => import('../../features/timeline/TimelineView'));
const RelationshipGraph = lazy(() => import('../../features/relationship-graph/RelationshipGraph'));
const WikiLayout = lazy(() => import('../../features/wiki-layout/WikiLayout'));
const WikiEntryPage = lazy(() => import('../../features/entity-view/pages/WikiEntryPage'));
const WikiLandingPage = lazy(() => import('../../features/entity-view/pages/WikiLandingPage'));

// Admin Features
const AdminLayout = lazy(() => import('../../features/admin-console/layouts/AdminLayout'));
const SplitPaneManager = lazy(() => import('../../features/admin-console/pages/SplitPaneManager'));

export const AppRoutes = () => {
	const { campaignId } = useCampaign();
	const isDev = import.meta.env.DEV;

	return (
		<Suspense fallback={<RouteLoading text='Loading Application...' />}>
			<Routes>
				{/* Admin Console */}
				{isDev && (
					<Route path='/dm' element={<AdminLayout />}>
						<Route index element={<Navigate to='/dm/manage/campaign' replace />} />
						<Route path='manage/:type/:id?' element={<SplitPaneManager />} />
					</Route>
				)}

				{/* Campaign Selection */}
				<Route path='/select-campaign' element={<CampaignSelect />} />

				{/* Main App */}
				{campaignId ? (
					<Route path='/' element={<MainLayout />}>
						<Route index element={<DashboardView />} />

						<Route path='atlas/:mapId' element={<MapView />} />
						<Route path='atlas' element={<Navigate to='/atlas/world_map' replace />} />
						<Route path='timeline' element={<TimelineView />} />
						<Route path='relationships' element={<RelationshipGraph />} />

						<Route path='wiki/:type' element={<WikiLayout />}>
							{/* CHANGED: Replaced placeholder with Landing Page */}
							<Route index element={<WikiLandingPage />} />
							<Route path=':entityId' element={<WikiEntryPage />} />
						</Route>

						<Route path='*' element={<Navigate to='/' replace />} />
					</Route>
				) : (
					<Route path='*' element={<Navigate to='/select-campaign' replace />} />
				)}
			</Routes>
		</Suspense>
	);
};
