import { Outlet } from 'react-router-dom';
import { useWikiNavigation } from './useWikiNavigation';
import { WikiSidebar } from '@/features/wiki/components/navigation/WikiSidebar';

export default function WikiLayout() {
	const navigation = useWikiNavigation();

	// REMOVED: The useEffect that auto-redirects to findFirstContentEntity

	return (
		<div className='relative flex flex-col lg:flex-row h-full bg-background overflow-hidden'>
			<WikiSidebar navigation={navigation} className='lg:w-72 lg:order-2 lg:border-l lg:border-border lg:h-full z-30' />

			<div className='flex-1 lg:order-1 overflow-y-auto bg-background relative z-0'>
				<Outlet />
			</div>
		</div>
	);
}
