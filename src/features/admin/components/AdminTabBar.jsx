import clsx from 'clsx';

export default function AdminTabBar({ tabs, activeTab, onChange }) {
	return (
		<div className='flex bg-muted p-1 rounded-lg border border-border shadow-inner gap-0.5'>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type='button'
					onClick={() => onChange(tab.id)}
					className={clsx(
						'flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all',
						activeTab === tab.id
							? 'bg-background shadow-sm text-foreground ring-1 ring-border'
							: 'text-muted-foreground hover:text-foreground hover:bg-background/50'
					)}>
					{tab.icon && <tab.icon size={13} />}
					{tab.label}
				</button>
			))}
		</div>
	);
}
