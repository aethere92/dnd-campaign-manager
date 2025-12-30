import { clsx } from 'clsx';

export default function Button({
	children,
	variant = 'primary',
	size = 'md',
	icon: Icon,
	fullWidth = false,
	disabled = false,
	className,
	...props
}) {
	const baseStyles =
		'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variants = {
		primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
		secondary: 'bg-gray-100 text-foreground hover:bg-gray-200 focus:ring-gray-500',
		ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base',
	};

	return (
		<button
			className={clsx(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
			disabled={disabled}
			{...props}>
			{Icon && <Icon size={16} />}
			{children}
		</button>
	);
}
