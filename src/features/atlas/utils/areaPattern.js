/**
 * Deterministic SVG pattern identity for map area fills (hatch / dots).
 *
 * Single source of truth shared by three places that must agree exactly:
 *   - PatternDefs, which registers `<pattern id={...}>`
 *   - MapAreas (public renderer), which references `url(#<id>)`
 *   - EditAreasLayer (admin editor), which references `url(#<id>)`
 *
 * When the id string was built by hand in each, they drifted — notably the base
 * opacity default differed (0.2 vs 0.3), so unfilled-opacity areas referenced a
 * pattern that was never registered and rendered with no fill. Deriving the id
 * here makes that class of mismatch impossible.
 */

// Authoritative default fill opacity. PatternDefs registers the pattern elements,
// so its default IS the id everyone else must reference.
const DEFAULT_FILL_OPACITY = 0.2;

/** True if this area uses a pattern fill (hatch or dots) rather than a solid one. */
export const isPatternFill = (area) => area.fillType === 'hatch' || area.fillType === 'dots';

/** The pattern id + the parameters needed to render its `<pattern>` element. */
export const getAreaPatternId = (area) => {
	const type = area.fillType;
	const color = area.interiorColor || '#d97706';
	const opacity = area.fillOpacity ?? DEFAULT_FILL_OPACITY;
	const spacing = area.fillSpacing || (type === 'hatch' ? 10 : 16);
	const weight = area.fillWeight || (type === 'hatch' ? 2 : 1.5);

	const safeColor = color.replace('#', '');
	const safeOpacity = Math.round(opacity * 100);

	return {
		id: `pattern-${type}-${safeColor}-${safeOpacity}-${spacing}-${weight}`,
		type,
		color,
		opacity,
		spacing,
		weight,
	};
};
