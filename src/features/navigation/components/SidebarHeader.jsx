import { SearchTrigger } from '@/features/search/components/SearchTrigger';

export const SidebarHeader = ({ campaign, onSearch }) => {
	return (
		<div className='p-4'>
			{/* Campaign Card */}
			<div className='hidden lg:flex items-center gap-3 px-2 py-2 mb-4 hover:bg-muted rounded-lg cursor-pointer transition-colors'>
				<div className='w-8 h-8 rounded bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-serif font-bold shadow-sm'>
					{campaign?.initial || 'C'}
				</div>
				<div className='flex-1 min-w-0'>
					<h2 className='text-sm font-bold text-foreground font-serif'>{campaign?.name || 'Loading...'}</h2>
				</div>
			</div>

			{/* Global Search Trigger - Desktop */}
			<div className='lg:mb-6'>
				<SearchTrigger onClick={onSearch} />
			</div>
		</div>
	);
};
