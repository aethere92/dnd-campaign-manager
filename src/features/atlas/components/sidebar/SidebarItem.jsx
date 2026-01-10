import React from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, Crosshair } from 'lucide-react';

export const SidebarItem = ({ label, isVisible, onToggle, onNavigate, icon: Icon }) => (
	<div className='flex items-center gap-1 px-2 py-2 md:py-0.5 hover:bg-black/5 group rounded-md transition-colors min-w-0'>
		<button
			onClick={(e) => {
				e.stopPropagation();
				onToggle();
			}}
			className={clsx(
				'p-2 md:p-0.5 rounded transition-colors shrink-0 outline-none',
				isVisible ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/40 hover:text-muted-foreground'
			)}>
			{isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
		</button>

		<button
			onClick={onNavigate}
			className='flex-1 flex items-center text-left min-w-0 gap-2 py-1 md:py-0.5 outline-none'>
			{Icon && <Icon size={12} className='text-muted-foreground/70 shrink-0' />}
			<span
				className={clsx(
					'text-sm md:text-xs truncate transition-opacity',
					!isVisible && 'opacity-50 text-muted-foreground'
				)}>
				{label}
			</span>
		</button>

		<button
			onClick={(e) => {
				e.stopPropagation();
				onNavigate();
			}}
			className='hidden md:block p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground group-hover:opacity-100 opacity-0 transition-all'
			title='Fly To'>
			<Crosshair size={12} />
		</button>
	</div>
);
