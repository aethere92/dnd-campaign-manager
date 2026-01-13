import React from 'react';
import clsx from 'clsx';

export default function TileSelector({ options, value, onChange }) {
	return (
		<div className='grid grid-cols-4 gap-2'>
			{options.map((opt) => {
				const isActive = value === opt.value;
				const Icon = opt.icon;
				return (
					<button
						key={opt.value}
						type='button'
						onClick={() => onChange(opt.value)}
						className={clsx(
							'flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all h-20',
							isActive
								? 'bg-primary/10 border-primary text-primary shadow-[inset_0_0_0_1px_rgba(217,119,6,0.5)]'
								: 'bg-card border-border hover:bg-muted/50 hover:border-primary/50 text-muted-foreground'
						)}>
						<Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
						<span className='text-[10px] font-bold uppercase tracking-wide'>{opt.label}</span>
					</button>
				);
			})}
		</div>
	);
}
