import { useMemo } from 'react';
import { extractHeaders } from '@/shared/utils/markdownUtils';
import { TableOfContents } from '@/features/table-of-contents/TableOfContents';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * MarkdownWithToC Component
 * Renders markdown with automatic Table of Contents generation
 *
 * @param {string} children - Markdown text
 * @param {boolean} showToC - Show table of contents (default true)
 * @param {number} tocMaxDepth - Maximum heading depth for ToC (default 3)
 * @param {string} layout - Layout mode: 'split' or 'top' (default 'split')
 * @param {string} className - Additional classes for markdown container
 */
export default function MarkdownWithToC({
	children,
	showToC = true,
	tocMaxDepth = 3,
	layout = 'split',
	className = '',
	components = {},
	...props
}) {
	// Extract headers for ToC
	const tocItems = useMemo(() => {
		if (!showToC || !children) return [];
		const headers = extractHeaders(children);
		return headers.filter((h) => h.depth <= tocMaxDepth);
	}, [children, showToC, tocMaxDepth]);

	// No ToC needed
	if (!showToC || tocItems.length === 0) {
		return (
			<MarkdownRenderer className={className} components={components} {...props}>
				{children}
			</MarkdownRenderer>
		);
	}

	// Top layout: ToC above content
	if (layout === 'top') {
		return (
			<div>
				<div className='mb-6'>
					<TableOfContents items={tocItems} />
				</div>
				<MarkdownRenderer className={className} components={components} {...props}>
					{children}
				</MarkdownRenderer>
			</div>
		);
	}

	// Split layout: ToC on side
	return (
		<div className='grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-8'>
			{/* Content */}
			<div className='min-w-0'>
				<MarkdownRenderer className={className} components={components} {...props}>
					{children}
				</MarkdownRenderer>
			</div>

			{/* ToC Sidebar */}
			<div className='hidden xl:block'>
				<TableOfContents items={tocItems} />
			</div>

			{/* Mobile ToC */}
			<div className='xl:hidden'>
				<TableOfContents items={tocItems} />
			</div>
		</div>
	);
}
