import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { useBreadcrumbs } from '@/shared/hooks/useBreadcrumbs';

export default function Breadcrumbs({ className }) {
	const crumbs = useBreadcrumbs();
	const location = useLocation();

	// 1. Explicitly exclude full-screen "World" views where overlays distract
	const BLACKLISTED_ROUTES = ['/timeline', '/relationships', '/atlas'];
	const isBlacklisted = BLACKLISTED_ROUTES.some((route) => location.pathname.startsWith(route));

	if (isBlacklisted) return null;

	// 2. Hide on "Landing Pages" (Depth check)
	// If we only have "Home > [Category]", the Page Title serves as the breadcrumb.
	// We only want to show this when deep navigating (e.g., "Home > Locations > Brindol")
	if (crumbs.length <= 2) return null;

	return (
		<nav
			className={clsx(
				'inline-flex items-center gap-1 px-3 py-1.5 rounded-full',
				'bg-background/60 backdrop-blur-md border border-border/50 shadow-sm',
				'text-xs font-medium text-muted-foreground',
				'transition-all hover:bg-background/90 hover:shadow-md hover:border-border',
				className
			)}
			aria-label='Breadcrumb'>
			<ol className='flex items-center gap-1.5'>
				{crumbs.map((crumb, index) => {
					const Icon = crumb.icon;
					const isFirst = index === 0;

					return (
						<li key={crumb.path} className='flex items-center'>
							{!isFirst && <ChevronRight size={10} className='text-muted-foreground/60 mx-0.5 shrink-0' />}

							{crumb.isCurrent ? (
								<span
									className={clsx('flex items-center gap-1.5 truncate max-w-[200px]', 'text-foreground font-semibold')}>
									{Icon && <Icon size={12} />}
									{crumb.label}
								</span>
							) : (
								<Link
									to={crumb.path}
									className='flex items-center gap-1.5 hover:text-accent transition-colors truncate max-w-[150px]'>
									{isFirst ? <Home size={12} /> : Icon && <Icon size={12} />}
									<span className={isFirst ? 'sr-only' : ''}>{crumb.label}</span>
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
