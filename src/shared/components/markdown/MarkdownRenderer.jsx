import ReactMarkdown from 'react-markdown';
import { generateId, extractText } from '@/shared/utils/textUtils';

/**
 * HeadingRenderer Component
 * Automatically adds IDs to headings for anchor links
 */
function HeadingRenderer({ level, children }) {
	const text = extractText(children);
	const id = generateId(text);
	const Tag = `h${level}`;
	return <Tag id={id}>{children}</Tag>;
}

/**
 * MarkdownRenderer Component
 * Pre-configured ReactMarkdown with sensible defaults
 *
 * @param {string} children - Markdown text
 * @param {Object} components - Custom component overrides
 * @param {boolean} addHeadingIds - Auto-generate heading IDs (default true)
 * @param {string} className - Additional CSS classes
 */
export default function MarkdownRenderer({
	children,
	components = {},
	addHeadingIds = true,
	className = '',
	...props
}) {
	// Safety check
	let safeText = children;
	if (Array.isArray(children)) {
		safeText = children.join('');
	} else if (typeof children !== 'string' && children !== null && children !== undefined) {
		safeText = String(children);
	}

	// Build component overrides
	const defaultComponents = {
		// Auto-add IDs to headings
		...(addHeadingIds && {
			h1: (props) => <HeadingRenderer level={1} {...props} />,
			h2: (props) => <HeadingRenderer level={2} {...props} />,
			h3: (props) => <HeadingRenderer level={3} {...props} />,
		}),
		// External links open in new tab
		a: ({ href, children }) => {
			if (href && !href.startsWith('#') && !href.startsWith('/')) {
				return (
					<a href={href} target='_blank' rel='noopener noreferrer'>
						{children}
					</a>
				);
			}
			return <a href={href}>{children}</a>;
		},
	};

	return (
		<ReactMarkdown className={className} components={{ ...defaultComponents, ...components }} {...props}>
			{safeText}
		</ReactMarkdown>
	);
}

/**
 * InlineMarkdown Component
 * For rendering markdown inside inline contexts (no block elements)
 *
 * @param {string} children - Markdown text
 */
export function InlineMarkdown({ children, ...props }) {
	return (
		<MarkdownRenderer
			components={{
				p: 'span',
				h1: 'strong',
				h2: 'strong',
				h3: 'strong',
				ul: 'span',
				ol: 'span',
				li: 'span',
			}}
			addHeadingIds={false}
			{...props}>
			{children}
		</MarkdownRenderer>
	);
}
