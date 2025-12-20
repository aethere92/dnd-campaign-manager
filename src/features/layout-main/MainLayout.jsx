import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useMainLayout } from './useMainLayout';
import { Sidebar } from './components/Sidebar';

export default function MainLayout() {
	const vm = useMainLayout();

	return (
		<div className='flex h-screen bg-background text-foreground overflow-hidden'>
			{' '}
			{/* UPDATED */}
			<Sidebar vm={vm} />
			<main className='flex-1 h-full overflow-hidden bg-background relative flex flex-col'>
				{' '}
				{/* UPDATED */}
				{/* Mobile Header */}
				<div className='lg:hidden flex items-center justify-between p-4 border-b border-border bg-background shrink-0'>
					{' '}
					{/* UPDATED */}
					<button
						onClick={() => vm.setSidebarOpen(true)}
						className='p-2 text-muted-foreground hover:bg-muted rounded-md'>
						<Menu size={20} />
					</button>
					<h1 className='text-sm font-serif font-bold'>{vm.campaign?.name || 'Campaign'}</h1>
					<div className='w-9' />
				</div>
				<div className='flex-1 overflow-hidden relative'>
					<Outlet />
				</div>
			</main>
		</div>
	);
}
