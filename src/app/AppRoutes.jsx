import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { RouteLoading } from './components/RouteLoading';

const CampaignSelect = lazy(() => import('@/features/campaign/components/CampaignSelect'));
const MainLayout = lazy(() => import('@/features/navigation/MainLayout'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const MapPage = lazy(() => import('@/features/atlas/MapPage'));
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
						<Route path='tools/replace' element={<BulkReplaceTool />} />
						<Route path='tools/migration' element={<MapMigrationTool />} />
						<Route path='tools/atlas' element={<MapManagerPage />} />
					</Route>
				)}

				{/* Campaign Selection */}
				<Route path='/select-campaign' element={<CampaignSelect />} />

				{/* Main App */}
				{campaignId ? (
					<Route path='/' element={<MainLayout />}>
						<Route index element={<DashboardPage />} />

						<Route path='atlas/:mapId' element={<MapPage />} />
						<Route path='atlas' element={<Navigate to='/atlas/world_map' replace />} />
						<Route path='timeline' element={<TimelinePage />} />
						<Route path='relationships' element={<GraphPage />} />

						<Route path='wiki/:type' element={<WikiLayout />}>
							<Route index element={<WikiLandingPage />} />
							<Route path=':entityId' element={<WikiDetailPage />} />
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
