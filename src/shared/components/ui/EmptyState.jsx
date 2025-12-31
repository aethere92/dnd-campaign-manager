import { clsx } from 'clsx';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
	return (
		<div className={clsx('flex flex-col items-center justify-center p-8 text-center', className)}>
			{Icon && (
				<div className='mb-4 rounded-full bg-muted p-4'>
					<Icon className='w-8 h-8 text-muted-foreground/70' strokeWidth={1.5} />
				</div>
			)}
			{title && <h3 className='text-lg font-serif font-semibold text-foreground mb-2'>{title}</h3>}
			{description && <p className='text-sm text-muted-foreground max-w-sm mb-6'>{description}</p>}
			{action && <div>{action}</div>}
		</div>
	);
}
