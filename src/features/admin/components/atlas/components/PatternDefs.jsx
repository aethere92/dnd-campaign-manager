// --- FILE: components/PatternDefs.jsx ---
import React, { useMemo } from 'react';

// Extract logic to avoid re-creation on every render
const generatePatternId = (area) => {
	const color = area.interiorColor || '#d97706';
	const type = area.fillType;
	const opacity = area.fillOpacity ?? 0.2;
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

const PatternDefsComponent = ({ areas }) => {
	const patterns = useMemo(() => {
		const uniquePatterns = new Map();

		areas.forEach((area) => {
			if (area.fillType === 'hatch' || area.fillType === 'dots') {
				const def = generatePatternId(area);
				if (!uniquePatterns.has(def.id)) {
					uniquePatterns.set(def.id, def);
				}
			}
		});

		return Array.from(uniquePatterns.values());
	}, [areas]);

	if (patterns.length === 0) return null;

	return (
		<svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}>
			<defs>
				{patterns.map(({ id, type, color, opacity, spacing, weight }) => (
					<pattern
						key={id}
						id={id}
						patternUnits='userSpaceOnUse'
						width={spacing}
						height={spacing}
						patternTransform={type === 'hatch' ? 'rotate(45)' : ''}>
						{type === 'hatch' && (
							<line
								x1='0'
								y1='0'
								x2='0'
								y2={spacing}
								stroke={color}
								strokeWidth={weight}
								strokeOpacity={opacity}
								strokeLinecap='square'
							/>
						)}
						{type === 'dots' && (
							<>
								<circle cx={spacing * 0.25} cy={spacing * 0.25} r={weight} fill={color} fillOpacity={opacity} />
								<circle cx={spacing * 0.75} cy={spacing * 0.75} r={weight} fill={color} fillOpacity={opacity} />
							</>
						)}
					</pattern>
				))}
			</defs>
		</svg>
	);
};

// Only re-render if the areas array length changes or reference changes
// This is safe because if an area updates its fill, the areas array ref changes in the reducer
export const PatternDefs = React.memo(PatternDefsComponent);
