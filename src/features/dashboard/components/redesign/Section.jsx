import { clsx } from 'clsx';
import { useReveal } from '../../hooks/useReveal';

/**
 * A full-bleed dashboard section with its own colour "biome".
 *
 * The page content is centred in a max-width column, but sections need their
 * tint to bleed edge-to-edge across the whole content area (beside the sidebar)
 * so each reads as its own world — like the mockup. This breaks out of the
 * centered column with negative margins, paints a biome glow behind, then
 * re-centers the children. Also handles reveal-on-scroll.
 *
 * @param {string} biome    CSS colour for the primary glow (e.g. a CSS var)
 * @param {string} [biome2] optional second corner glow colour
 * @param {boolean} [reveal=true] fade/rise in on scroll
 */
export function Section({ biome, biome2, reveal = true, className, innerClassName, children }) {
	const { ref, shown } = useReveal();

	const style = {};
	if (biome) style['--dash-biome'] = biome;
	if (biome2) style['--dash-biome-2'] = biome2;

	return (
		<section
			ref={reveal ? ref : undefined}
			style={style}
			className={clsx('relative w-full py-14 sm:py-20', className)}>
			{/* biome glow spans the full content-area width */}
			<div className='dash-biome' />
			<div
				className={clsx(
					'relative z-10 px-4 sm:px-8 max-w-6xl mx-auto',
					reveal && 'dash-reveal',
					reveal && shown && 'is-shown',
					innerClassName
				)}>
				{children}
			</div>
		</section>
	);
}
