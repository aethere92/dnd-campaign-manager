import { clsx } from 'clsx';
import { useReveal } from '../../hooks/useReveal';

/**
 * Wraps a section so it fades/rises in when scrolled into view.
 * Thin wrapper over useReveal so pages stay declarative.
 */
export function Reveal({ children, className }) {
	const { ref, shown } = useReveal();
	return (
		<div ref={ref} className={clsx('dash-reveal', shown && 'is-shown', className)}>
			{children}
		</div>
	);
}
