import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { RouteLoading } from './components/RouteLoading';

// --- Lazy Imports (FIXED PATHS) ---

// 1. Campaign Selection
const CampaignSelect = lazy(() => import('../../features/campaign-session/components/CampaignSelect'));

// 2. Main Layout
const MainLayout = lazy(() => import('../../features/layout-main/MainLayout'));

// 3. World Views (Moved from pages to features)
const MapView = lazy(() => import('../../features/world-map/MapView')); // <--- FIXED
const TimelineView = lazy(() => import('../../features/timeline/TimelineView'));
const RelationshipGraph = lazy(() => import('../../features/relationship-graph/RelationshipGraph'));

// 4. Wiki Views
const WikiLayout = lazy(() => import('../../features/wiki-layout/WikiLayout'));
const WikiEntryPage = lazy(() => import('../../features/entity-view/pages/WikiEntryPage'));

export const AppRoutes = () => {
	const { campaignId } = useCampaign();

	// Guard Clause: No Campaign Selected
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
					{/* World Views */}
					<Route index element={<MapView />} />
					<Route path='timeline' element={<TimelineView />} />
					<Route path='relationships' element={<RelationshipGraph />} />

					{/* Wiki Views */}
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
