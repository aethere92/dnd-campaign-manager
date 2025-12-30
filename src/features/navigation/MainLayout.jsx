import { Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react'; // Added Search Icon
import { useMainLayout } from '@/features/navigation/useNavigation';
import { Sidebar } from './components/Sidebar';
import DevAdminButton from '@/shared/components/ui/DevAdminButton';
import Breadcrumbs from '@/shared/components/ui/Breadcrumbs';
import GlobalSearch from '@/features/search/GlobalSearch';
import { SearchProvider, useSearch } from '@/features/search/SearchContext'; // Import Provider

// Separate component to access Context inside Provider
const MobileHeaderActions = ({ vm }) => {
	const { openSearch } = useSearch();

	return (
		<div className='lg:hidden flex items-center justify-between p-4 border-b border-border bg-background shrink-0'>
			<button onClick={() => vm.setSidebarOpen(true)} className='p-2 text-muted-foreground hover:bg-muted rounded-md'>
				<Menu size={20} />
			</button>
			<h1 className='text-sm font-serif font-bold'>{vm.campaign?.name || 'Campaign'}</h1>

			{/* NEW: Mobile Search Trigger */}
			<button onClick={openSearch} className='p-2 text-muted-foreground hover:bg-muted rounded-md'>
				<Search size={20} />
			</button>
		</div>
	);
};

export default function MainLayout() {
	const vm = useMainLayout();

	return (
		<SearchProvider>
			<div className='flex h-screen bg-background text-foreground overflow-hidden'>
				<Sidebar vm={vm} />
				<main className='flex-1 h-full overflow-hidden bg-background relative flex flex-col'>
					{/* Updated Mobile Header */}
					<MobileHeaderActions vm={vm} />

					<div className='absolute top-4 left-6 z-40 hidden lg:block pointer-events-none'>
						<div className='pointer-events-auto'>
							<Breadcrumbs />
						</div>
					</div>

					<div className='flex-1 overflow-hidden relative'>
						<Outlet />
					</div>
					<DevAdminButton />
				</main>

				{/* Search Modal lives here now */}
				<GlobalSearch />
			</div>
		</SearchProvider>
	);
}
