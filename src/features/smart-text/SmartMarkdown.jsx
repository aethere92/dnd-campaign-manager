import ReactMarkdown from 'react-markdown';
import { useSmartText } from './useSmartText';
import { SmartEntityLink } from './components/SmartEntityLink';
import { generateId } from '../table-of-contents/utils'; // Import helper

export default function SmartMarkdown({ children, ...props }) {
	// ... existing safety check code ...
	let safeText = children;
	if (Array.isArray(children)) {
		safeText = children.join('');
	} else if (typeof children !== 'string' && children !== null && children !== undefined) {
		safeText = String(children);
	}

	const processedText = useSmartText(safeText);

	// Helper to extract text from children for ID generation
	const getText = (children) => {
		if (typeof children === 'string') return children;
		if (Array.isArray(children)) return children.map(getText).join('');
		if (children?.props?.children) return getText(children.props.children);
		return '';
	};

	const HeadingRenderer = ({ level, children }) => {
		const text = getText(children);
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
