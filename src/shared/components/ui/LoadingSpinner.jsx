import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function LoadingSpinner({ size = 'md', text = 'Loading...', className }) {
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};

	return (
		<div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
			<Loader2 className={clsx(sizes[size], 'animate-spin text-amber-600')} />
			{text && <p className='text-sm text-gray-500 font-medium'>{text}</p>}
		</div>
	);
}
