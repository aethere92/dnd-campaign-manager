import { clsx } from 'clsx';

/**
 * SplitView Component
 * Responsive 2-column layout pattern
 *
 * @param {React.ReactNode} sidebar - Sidebar content
 * @param {React.ReactNode} main - Main content
 * @param {string} sidebarPosition - 'left' or 'right' (default 'left')
 * @param {string} sidebarWidth - Sidebar width class (default 'lg:w-64')
 * @param {boolean} stickyHeader - Make sidebar sticky (default false)
 * @param {string} className - Additional container classes
 */
export default function SplitView({
	sidebar,
	main,
	sidebarPosition = 'left',
	sidebarWidth = 'lg:w-64',
	stickyHeader = false,
	className = '',
	...props
}) {
	const sidebarClasses = clsx(
		'min-w-0',
		sidebarWidth,
		stickyHeader && 'lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto'
	);

	const mainClasses = 'flex-1 min-w-0';

	return (
		<div className={clsx('flex flex-col lg:flex-row gap-4 lg:gap-6', className)} {...props}>
			{sidebarPosition === 'left' && <aside className={sidebarClasses}>{sidebar}</aside>}

			<main className={mainClasses}>{main}</main>

			{sidebarPosition === 'right' && <aside className={clsx(sidebarClasses, 'lg:order-2')}>{sidebar}</aside>}
		</div>
	);
}

/**
 * ThreeColumnLayout Component
 * For pages with sidebar, main content, and ToC/meta panel
 *
 * @param {React.ReactNode} left - Left sidebar
 * @param {React.ReactNode} center - Main content
 * @param {React.ReactNode} right - Right panel (ToC, etc.)
 * @param {string} className - Additional container classes
 */
export function ThreeColumnLayout({ left, center, right, className = '', ...props }) {
	return (
		<div
			className={clsx('grid grid-cols-1 xl:grid-cols-[1fr_48rem_1fr] gap-6 max-w-[1920px] mx-auto', className)}
			{...props}>
			{/* Left Gutter (Hidden on smaller screens) */}
			<div className='hidden xl:block' aria-hidden='true'>
				{left}
			</div>

			{/* Center Content */}
			<div className='min-w-0'>{center}</div>

			{/* Right Panel */}
			<div className='hidden xl:block'>{right}</div>
		</div>
	);
}
