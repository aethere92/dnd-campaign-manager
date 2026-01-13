import React from 'react';

/**
 * Generates SVG Pattern Definitions for Leaflet
 * Renders a hidden SVG containing <defs> for hatch and dot patterns
 * Now supports Opacity baking and Staggered Dots
 */
export const PatternDefs = ({ areas }) => {
	// 1. Find all unique pattern/color/opacity combinations needed
	const patterns = new Map();

	areas.forEach((area) => {
		if (area.fillType === 'hatch' || area.fillType === 'dots') {
			const color = area.interiorColor || '#d97706';
			const type = area.fillType;
			// Use opacity in ID to force re-render when slider changes
			const opacity = area.fillOpacity ?? 0.2;

			// Create a safe ID string
			const safeColor = color.replace('#', '');
			const safeOpacity = Math.round(opacity * 100);
			const id = `pattern-${type}-${safeColor}-${safeOpacity}`;

			if (!patterns.has(id)) {
				patterns.set(id, { id, type, color, opacity });
			}
		}
	});

	if (patterns.size === 0) return null;

	return (
		<svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}>
			<defs>
				{Array.from(patterns.values()).map(({ id, type, color, opacity }) => (
					<pattern
						key={id}
						id={id}
						patternUnits='userSpaceOnUse'
						width={type === 'hatch' ? 10 : 16}
						height={type === 'hatch' ? 10 : 16}
						patternTransform={type === 'hatch' ? 'rotate(45)' : ''}>
						{type === 'hatch' && (
							<line x1='0' y1='0' x2='0' y2='10' stroke={color} strokeWidth='2' strokeOpacity={opacity} />
						)}
						{type === 'dots' && (
							// Staggered Dot Pattern (Quincunx / Hexagonal-ish)
							<>
								<circle cx='4' cy='4' r='1.5' fill={color} fillOpacity={opacity} />
								<circle cx='12' cy='12' r='1.5' fill={color} fillOpacity={opacity} />
							</>
						)}
					</pattern>
				))}
			</defs>
		</svg>
	);
};
