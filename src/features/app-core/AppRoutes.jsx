import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { RouteLoading } from './components/RouteLoading';

const CampaignSelect = lazy(() => import('../../features/campaign-session/components/CampaignSelect'));
const MainLayout = lazy(() => import('../../features/layout-main/MainLayout'));
const MapView = lazy(() => import('../../features/world-map/MapView'));
const TimelineView = lazy(() => import('../../features/timeline/TimelineView'));
const RelationshipGraph = lazy(() => import('../../features/relationship-graph/RelationshipGraph'));
const WikiLayout = lazy(() => import('../../features/wiki-layout/WikiLayout'));
const WikiEntryPage = lazy(() => import('../../features/entity-view/pages/WikiEntryPage'));

const AdminLayout = lazy(() => import('../../features/admin-console/layouts/AdminLayout'));
const SplitPaneManager = lazy(() => import('../../features/admin-console/pages/SplitPaneManager'));

export const AppRoutes = () => {
	const { campaignId } = useCampaign();

	return (
		<Suspense fallback={<RouteLoading text='Loading Application...' />}>
			<Routes>
				{/* --- 1. ADMIN CONSOLE --- */}
				<Route path='/dm' element={<AdminLayout />}>
					<Route index element={<Navigate to='/dm/manage/campaign' replace />} />
					<Route path='manage/:type/:id?' element={<SplitPaneManager />} />
				</Route>

				{/* --- 2. CAMPAIGN SELECTION (Explicit Route) --- */}
				<Route path='/select-campaign' element={<CampaignSelect />} />

				{/* --- 3. MAIN APP (Protected) --- */}
				{campaignId ? (
					<Route path='/' element={<MainLayout />}>
						{/* FIX #2: Default to Session list instead of Atlas */}
						<Route index element={<Navigate to='/wiki/session' replace />} />

						<Route path='atlas/:mapId' element={<MapView />} />
						<Route path='atlas' element={<Navigate to='/atlas/world_map' replace />} />
						<Route path='timeline' element={<TimelineView />} />
						<Route path='relationships' element={<RelationshipGraph />} />

						<Route path='wiki/:type' element={<WikiLayout />}>
							<Route
								index
								element={<div className='h-full flex items-center justify-center text-gray-400'>Select an entry</div>}
							/>
							<Route path=':entityId' element={<WikiEntryPage />} />
						</Route>
					</Route>
				) : (
					// Fallback to selection if hitting root without ID
					<Route path='*' element={<Navigate to='/select-campaign' replace />} />
				)}
			</Routes>
		</Suspense>
	);
};
