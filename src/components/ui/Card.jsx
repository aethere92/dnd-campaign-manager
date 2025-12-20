import { clsx } from 'clsx';

export function Card({ children, className, padding = true, hover = false, ...props }) {
	return (
		<div
			className={clsx(
				'bg-[var(--card-bg)] border border-border rounded-lg shadow-sm',
				padding && 'p-4',
				hover && 'transition-shadow hover:shadow-md',
				className
			)}
			{...props}>
			{children}
		</div>
	);
}

export function CardHeader({ children, className }) {
	return <div className={clsx('border-b border-border pb-3 mb-3', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
	return <h3 className={clsx('text-lg font-serif font-semibold text-foreground', className)}>{children}</h3>;
}

export function CardContent({ children, className }) {
	return <div className={className}>{children}</div>;
}
