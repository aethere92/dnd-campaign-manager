import ReactMarkdown from 'react-markdown';
import { useSmartText } from './useSmartText';
import { SmartEntityLink } from './components/SmartEntityLink';

export default function SmartMarkdown({ children, ...props }) {
	// SAFETY CHECK: Ensure children is string
	let safeText = children;
	if (Array.isArray(children)) {
		safeText = children.join('');
	} else if (typeof children !== 'string' && children !== null && children !== undefined) {
		safeText = String(children);
	}

	// 1. Process the text (inject links)
	const processedText = useSmartText(safeText);

	return (
		<ReactMarkdown
			{...props}
			components={{
				...props.components,
				// Custom Renderer for Links
				a: ({ href, children }) => {
					// Check if this is one of our "Smart Links"
					if (href && href.startsWith('#entity/')) {
						const [, id, type] = href.split('/');
						return (
							<SmartEntityLink id={id} type={type}>
								{children}
							</SmartEntityLink>
						);
					}

					// Default external link behavior
					return (
						<a href={href} className='text-blue-600 hover:underline' target='_blank' rel='noopener noreferrer'>
							{children}
						</a>
					);
				},
			}}>
			{processedText}
		</ReactMarkdown>
	);
}
