import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useWikiNavigation } from './useWikiNavigation';
import { WikiSidebar } from './components/WikiSidebar';

// --- NEW HELPER: Recursive Search ---
// Finds the first entity that matches the requested section type
const findFirstContentEntity = (items, targetType) => {
	for (const item of items) {
		// 1. Found a direct match? (e.g. an NPC in the NPC section)
		if (item.type === targetType) {
			return item;
		}

		// 2. If it's a folder (Location) with children, look inside
		if (item.children && item.children.length > 0) {
			const found = findFirstContentEntity(item.children, targetType);
			if (found) return found;
		}
	}
	return null;
};

export default function WikiLayout() {
	const navigation = useWikiNavigation();
	const navigate = useNavigate();
	const { type, entityId } = useParams();

	// Ensure we match the internal type string (e.g. 'sessions' -> 'session')
	const normalizedType = type === 'sessions' ? 'session' : type;

	// Auto-select first item if on index route and items exist
	useEffect(() => {
		if (!entityId && !navigation.isLoading && navigation.groups.length > 0) {
			const firstGroup = navigation.groups[0];

			if (firstGroup && firstGroup.items.length > 0) {
				// CHANGED: Use recursive search instead of blindly taking items[0]
				const match = findFirstContentEntity(firstGroup.items, normalizedType);

				// Fallback: If no matching child found (e.g. empty folder),
				// just show the folder (items[0]) so the user isn't staring at a blank screen.
				const target = match || firstGroup.items[0];

				navigate(`/wiki/${type}/${target.path}`, { replace: true });
			}
		}
	}, [entityId, navigation.isLoading, navigation.groups, navigate, type, normalizedType]);

	return (
		<div className='relative flex flex-col lg:flex-row h-full bg-background overflow-hidden'>
			<WikiSidebar navigation={navigation} className='lg:w-72 lg:order-2 lg:border-l lg:border-border lg:h-full z-30' />

			<div className='flex-1 lg:order-1 overflow-y-auto bg-background relative z-0'>
				<Outlet />
			</div>
		</div>
	);
}
