import { clsx } from 'clsx';

export const SidebarNav = ({ structure, currentPath, onNavigate }) => {
	return (
		<div className='flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar'>
			{structure.map((group) => (
				<div key={group.title}>
					<h3 className='px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2'>
						{group.title}
					</h3>
					<div className='space-y-0.5'>
						{group.items.map((item) => {
							const isWiki = item.path.startsWith('/wiki/');
							const active = isWiki ? currentPath.startsWith(item.path) : currentPath === item.path;
							const Icon = item.Icon;
							return (
								<button
									key={item.path}
									onClick={() => onNavigate(item.path)}
									className={clsx(
										'flex items-center w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
										active
											? 'bg-background shadow-sm ring-1 ring-border'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}>
									<Icon size={16} className={clsx('mr-2', active ? 'text-amber-600' : 'text-muted-foreground/70')} />
									{item.label}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};
