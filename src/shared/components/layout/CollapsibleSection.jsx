import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * CollapsibleSection Component
 * Expandable/collapsible content section
 *
 * @param {string} title - Section title
 * @param {React.ReactNode} children - Section content
 * @param {boolean} defaultOpen - Initial state (default true)
 * @param {React.Component} icon - Optional icon component
 * @param {string} size - Title size: 'sm', 'md', 'lg' (default 'md')
 * @param {string} variant - Style variant: 'default', 'bordered', 'card' (default 'default')
 * @param {string} className - Additional classes
 */
export default function CollapsibleSection({
	title,
	children,
	defaultOpen = true,
	icon: Icon = null,
	size = 'md',
	variant = 'default',
	className = '',
	...props
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
	};

	const variantClasses = {
		default: '',
		bordered: 'border border-border rounded-lg p-3',
		card: 'bg-background border border-border rounded-lg shadow-sm',
	};

	const headerPadding = variant === 'card' ? 'p-3' : '';
	const contentPadding = variant === 'card' ? 'p-3 pt-0' : '';

	return (
		<div className={clsx(variantClasses[variant], className)} {...props}>
			{/* Header */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={clsx(
					'w-full flex items-center gap-2 font-semibold uppercase tracking-wider text-muted-foreground',
					'hover:text-foreground/80 transition-colors select-none',
					sizeClasses[size],
					headerPadding
				)}>
				{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
				{Icon && <Icon size={14} className='opacity-70' />}
				<span className='flex-1 text-left truncate'>{title}</span>
			</button>

			{/* Content */}
			{isOpen && <div className={contentPadding}>{children}</div>}
		</div>
	);
}

/**
 * CollapsibleList Component
 * List of collapsible sections with consistent styling
 *
 * @param {Array<{title: string, content: ReactNode, icon?: Component}>} sections - Section definitions
 * @param {string} variant - Style variant (default 'default')
 * @param {string} className - Additional classes
 */
export function CollapsibleList({ sections, variant = 'default', className = '', ...props }) {
	return (
		<div className={clsx('space-y-2', className)} {...props}>
			{sections.map((section, index) => (
				<CollapsibleSection
					key={section.id || index}
					title={section.title}
					icon={section.icon}
					variant={variant}
					defaultOpen={section.defaultOpen !== false}>
					{section.content}
				</CollapsibleSection>
			))}
		</div>
	);
}
