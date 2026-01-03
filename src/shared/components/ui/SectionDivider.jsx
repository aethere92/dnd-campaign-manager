import { Diamond } from 'lucide-react';
import { clsx } from 'clsx';

export const SectionDivider = ({ className = 'my-6' }) => (
	<div className={clsx('flex items-center gap-4 opacity-80 select-none', className)}>
		<div className='h-px bg-border flex-1' />
		<div className='flex-shrink-0 text-primary/40'>
			<Diamond size={10} fill='currentColor' />
		</div>
		<div className='h-px bg-border flex-1' />
	</div>
);

export const SectionDividerVertical = ({ className = 'mx-6 h-full min-h-[50px]' }) => (
	<div className={clsx('flex flex-col items-center gap-4 opacity-80 select-none', className)}>
		<div className='w-px bg-border flex-1' />
		<div className='flex-shrink-0 text-primary/40'>
			<Diamond size={10} fill='currentColor' />
		</div>
		<div className='w-px bg-border flex-1' />
	</div>
);
