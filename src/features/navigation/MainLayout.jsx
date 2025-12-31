import { Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useMainLayout } from '@/features/navigation/useNavigation';
import { Sidebar } from './components/Sidebar';
import DevAdminButton from '@/shared/components/ui/DevAdminButton';
import Breadcrumbs from '@/shared/components/ui/Breadcrumbs';
import GlobalSearch from '@/features/search/GlobalSearch';
import { SearchProvider, useSearch } from '@/features/search/SearchContext';

const MobileHeaderActions = ({ vm }) => {
	const { openSearch } = useSearch();

	return (
		// CHANGED: Added pt-safe for notch support and min-h for touch targets
		<div className='lg:hidden flex items-center justify-between px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] border-b border-border bg-background/95 backdrop-blur-md shrink-0 sticky top-0 z-40 transition-all'>
			<button
				onClick={() => vm.setSidebarOpen(true)}
				className='p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-full active:scale-95 transition-transform'
				aria-label='Open Menu'>
				<Menu size={24} strokeWidth={1.5} />
			</button>

			<h1 className='text-base font-serif font-bold truncate max-w-[60%]'>{vm.campaign?.name || 'Campaign'}</h1>

			<button
				onClick={openSearch}
				className='p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-full active:scale-95 transition-transform'
				aria-label='Search'>
				<Search size={24} strokeWidth={1.5} />
			</button>
		</div>
	);
};

export default function MainLayout() {
	const vm = useMainLayout();

	return (
		<SearchProvider>
			<div className='flex h-full w-full bg-background text-foreground overflow-hidden'>
				<Sidebar vm={vm} />
				<main className='flex-1 h-full overflow-hidden bg-background relative flex flex-col w-full'>
					{/* Mobile Header */}
					<MobileHeaderActions vm={vm} />

					{/* Desktop Breadcrumbs */}
					<div className='absolute top-4 left-6 z-40 hidden lg:block pointer-events-none'>
						<div className='pointer-events-auto'>
							<Breadcrumbs />
						</div>
					</div>

					{/* Content Area */}
					<div className='flex-1 overflow-hidden relative w-full'>
						<Outlet />
					</div>

					<DevAdminButton />
				</main>

				<GlobalSearch />
			</div>
		</SearchProvider>
	);
}
