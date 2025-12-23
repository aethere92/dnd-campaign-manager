import { Diamond } from 'lucide-react';

export const SectionDivider = () => (
	<div className='flex items-center gap-4 my-6 opacity-80 select-none'>
		<div className='h-px bg-border flex-1' />
		<div className='flex-shrink-0 text-accent/50'>
			<Diamond size={10} fill='currentColor' />
		</div>
		<div className='h-px bg-border flex-1' />
	</div>
);
