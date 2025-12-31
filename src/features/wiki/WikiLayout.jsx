import { Outlet } from 'react-router-dom';
import { useWikiNavigation } from './useWikiNavigation';
import { WikiSidebar } from '@/features/wiki/components/navigation/WikiSidebar';

export default function WikiLayout() {
	const navigation = useWikiNavigation();

	return (
		<div className='relative flex flex-col lg:flex-row h-full bg-background overflow-hidden'>
			{/* Sidebar - First in DOM for Mobile Top position, Ordered 2nd for Desktop Right position */}
			<WikiSidebar navigation={navigation} className='lg:order-2 lg:border-l lg:border-border lg:h-full z-30' />

			{/* Main Content */}
			<div className='flex-1 lg:order-1 overflow-y-auto bg-background relative z-0 custom-scrollbar'>
				<Outlet />
			</div>
		</div>
	);
}
