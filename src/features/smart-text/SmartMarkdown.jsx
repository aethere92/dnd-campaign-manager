import ReactMarkdown from 'react-markdown';
import { useSmartText } from './useSmartText';
import { SmartEntityLink } from './components/SmartEntityLink';
import { EntityEmbed } from './components/EntityEmbed'; // New Import
import { generateId, extractText } from '../../utils/text/textProcessing';

export default function SmartMarkdown({ children, ...props }) {
	// ... (Existing safety check logic) ...
	let safeText = children;
	if (Array.isArray(children)) {
		safeText = children.join('');
	} else if (typeof children !== 'string' && children !== null && children !== undefined) {
		safeText = String(children);
	}

	const processedText = useSmartText(safeText);

	const HeadingRenderer = ({ level, children }) => {
		const text = extractText(children);
		const id = generateId(text);
		const Tag = `h${level}`;
		return <Tag id={id}>{children}</Tag>;
	};

	return (
		<ReactMarkdown
			{...props}
			components={{
				...props.components,
				h1: (props) => <HeadingRenderer level={1} {...props} />,
				h2: (props) => <HeadingRenderer level={2} {...props} />,
				h3: (props) => <HeadingRenderer level={3} {...props} />,

				// UPGRADED LINK RENDERER
				a: ({ href, children }) => {
					// 1. Check for Entity Link Protocol
					if (href && href.startsWith('#entity/')) {
						const parts = href.split('/');
						const id = parts[1];
						const type = parts[2] || 'default';

						// Check content for Embed Pattern: ":: Label ::"
						const textContent = String(children);
						const isEmbed = textContent.startsWith('::') && textContent.endsWith('::');

						if (isEmbed) {
							// Clean the label (remove ::)
							const label = textContent.replace(/^::\s*|\s*::$/g, '');
							return <EntityEmbed id={id} type={type} label={label} />;
						}

						return (
							<SmartEntityLink id={id} type={type}>
								{children}
							</SmartEntityLink>
						);
					}

					// 2. External Links
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
