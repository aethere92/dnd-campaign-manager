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

export const AppRoutes = () => {
	const { campaignId } = useCampaign();

	if (!campaignId) {
		return (
			<Suspense fallback={<RouteLoading text='Loading...' />}>
				<CampaignSelect />
			</Suspense>
		);
	}

	return (
		<Suspense fallback={<RouteLoading text='Loading Application...' />}>
			<Routes>
				<Route path='/' element={<MainLayout />}>
					{/* FIXED: Atlas route with optional mapId param */}
					<Route index element={<Navigate to='/atlas/world_map' replace />} />
					<Route path='atlas/:mapId' element={<MapView />} />
					<Route path='atlas' element={<Navigate to='/atlas/world_map' replace />} />

					<Route path='timeline' element={<TimelineView />} />
					<Route path='relationships' element={<RelationshipGraph />} />

					<Route path='wiki/:type' element={<WikiLayout />}>
						<Route
							index
							element={
								<div className='h-full flex items-center justify-center text-gray-400 italic'>
									Select an entry to view details
								</div>
							}
						/>
						<Route path=':entityId' element={<WikiEntryPage />} />
					</Route>

					{/* Legacy Redirects */}
					<Route path='sessions' element={<Navigate to='/wiki/session' replace />} />
					<Route path='characters' element={<Navigate to='/wiki/character' replace />} />
					<Route path='npcs' element={<Navigate to='/wiki/npc' replace />} />
					<Route path='locations' element={<Navigate to='/wiki/location' replace />} />
					<Route path='quests' element={<Navigate to='/wiki/quest' replace />} />
					<Route path='encounters' element={<Navigate to='/wiki/encounter' replace />} />
				</Route>
			</Routes>
		</Suspense>
	);
};
