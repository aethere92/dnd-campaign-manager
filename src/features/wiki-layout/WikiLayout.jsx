import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useWikiNavigation } from './useWikiNavigation';
import { WikiSidebar } from './components/WikiSidebar';

export default function WikiLayout() {
	const navigation = useWikiNavigation();
	const navigate = useNavigate();
	const { type, entityId } = useParams();

	// Auto-select first item if on index route and items exist
	useEffect(() => {
		// Only run if:
		// 1. We're on the index route (no entityId)
		// 2. Data has loaded
		// 3. We have groups with items
		if (!entityId && !navigation.isLoading && navigation.groups.length > 0) {
			// Find the first item across all groups
			const firstGroup = navigation.groups[0];
			if (firstGroup && firstGroup.items.length > 0) {
				const firstItem = firstGroup.items[0];
				// Navigate to the first item
				navigate(`/wiki/${type}/${firstItem.path}`, { replace: true });
			}
		}
	}, [entityId, navigation.isLoading, navigation.groups, navigate, type]);

	return (
		<div className='relative flex flex-col lg:flex-row h-full bg-background overflow-hidden'>
			<WikiSidebar navigation={navigation} className='lg:w-72 lg:order-2 lg:border-l lg:border-border lg:h-full z-30' />

			<div className='flex-1 lg:order-1 overflow-y-auto bg-background relative z-0'>
				<Outlet />
			</div>
		</div>
	);
}
