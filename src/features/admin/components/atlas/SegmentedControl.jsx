import React from 'react';
import clsx from 'clsx';

export default function SegmentedControl({ options, value, onChange }) {
	return (
		<div className='flex bg-muted/50 p-1 rounded-lg border border-border'>
			{options.map((opt) => (
				<button
					key={opt.value}
					type='button'
					onClick={() => onChange(opt.value)}
					className={clsx(
						'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all',
						value === opt.value
							? 'bg-background text-primary shadow-sm ring-1 ring-black/5'
							: 'text-muted-foreground hover:text-foreground hover:bg-background/50'
					)}>
					{opt.icon && <opt.icon size={12} />}
					{opt.label}
				</button>
			))}
		</div>
	);
}
