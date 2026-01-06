import ReactMarkdown from 'react-markdown';
import { useSmartText } from './useSmartText';
import { SmartEntityLink } from './components/SmartEntityLink';
import { EntityEmbed } from './components/EntityEmbed';
import { generateId, extractText } from '@/shared/utils/textUtils';
import { Link } from 'react-router-dom';
import { getEntityStyles } from '@/domain/entity/config/entityStyles';

export default function SmartMarkdown({ children, inline = false, disableTooltips = false, ...props }) {
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
			disallowedElements={inline ? ['p'] : []}
			unwrapDisallowed={inline}
			components={{
				...props.components,
				h1: (props) => <HeadingRenderer level={1} {...props} />,
				h2: (props) => <HeadingRenderer level={2} {...props} />,
				h3: (props) => <HeadingRenderer level={3} {...props} />,

				a: ({ href, children }) => {
					if (href && href.startsWith('#entity/')) {
						const parts = href.split('/');
						const id = parts[1];
						const type = parts[2] || 'default';

						const textContent = String(children);
						const isEmbed = textContent.startsWith('::') && textContent.endsWith('::');

						if (isEmbed) {
							const label = textContent.replace(/^::\s*|\s*::$/g, '');
							return <EntityEmbed id={id} type={type} label={label} />;
						}

						// PREVENT RECURSIVE TOOLTIPS
						if (disableTooltips) {
							const styles = getEntityStyles(type);
							return (
								<Link
									to={`/wiki/${type}/${id}`}
									className={`${styles.text} font-semibold hover:underline cursor-pointer`}
									onClick={(e) => e.stopPropagation()} // Prevent card click
								>
									{children}
								</Link>
							);
						}

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
