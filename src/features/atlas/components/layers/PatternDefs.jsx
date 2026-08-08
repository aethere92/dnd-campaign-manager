import React, { useMemo } from 'react';
import { getAreaPatternId, isPatternFill } from '@/features/atlas/utils/areaPattern';

/**
 * SVG fill patterns for map areas (hatch / dots).
 *
 * Moved here from features/admin: it is a rendering concern used by BOTH the
 * public map (MapAreas) and the admin editor (EditAreasLayer), so public code
 * importing it from the admin feature was a backwards dependency. The id logic
 * lives in utils/areaPattern so this file exports only a component (fast refresh).
 */

const PatternDefsComponent = ({ areas }) => {
	const patterns = useMemo(() => {
		const uniquePatterns = new Map();

		areas.forEach((area) => {
			if (isPatternFill(area)) {
				const def = getAreaPatternId(area);
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

// Only re-render if the areas array length changes or reference changes.
// This is safe because if an area updates its fill, the areas array ref changes in the reducer.
export const PatternDefs = React.memo(PatternDefsComponent);
