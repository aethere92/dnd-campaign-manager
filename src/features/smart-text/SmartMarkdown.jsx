import ReactMarkdown from 'react-markdown';
import { useSmartText } from './useSmartText';
import { SmartEntityLink } from './components/SmartEntityLink';
import { generateId, extractText } from '../../utils/text/textProcessing';

export default function SmartMarkdown({ children, ...props }) {
	// ... existing safety check code ...
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
				// Inject ID generators
				h1: (props) => <HeadingRenderer level={1} {...props} />,
				h2: (props) => <HeadingRenderer level={2} {...props} />,
				h3: (props) => <HeadingRenderer level={3} {...props} />,
				// Existing link renderer
				a: ({ href, children }) => {
					// ... existing link logic ...
					if (href && href.startsWith('#entity/')) {
						const [, id, type] = href.split('/');
						return (
							<SmartEntityLink id={id} type={type}>
								{children}
							</SmartEntityLink>
						);
					}
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
