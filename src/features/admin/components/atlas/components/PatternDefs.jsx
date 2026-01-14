import React from 'react';

export const PatternDefs = ({ areas }) => {
	const patterns = new Map();

	areas.forEach((area) => {
		if (area.fillType === 'hatch' || area.fillType === 'dots') {
			const color = area.interiorColor || '#d97706';
			const type = area.fillType;
			const opacity = area.fillOpacity ?? 0.2;

			// Use defaults if new props aren't set
			const spacing = area.fillSpacing || (type === 'hatch' ? 10 : 16);
			const weight = area.fillWeight || (type === 'hatch' ? 2 : 1.5);

			const safeColor = color.replace('#', '');
			const safeOpacity = Math.round(opacity * 100);

			// Generate ID based on all visual properties
			const id = `pattern-${type}-${safeColor}-${safeOpacity}-${spacing}-${weight}`;

			if (!patterns.has(id)) {
				patterns.set(id, { id, type, color, opacity, spacing, weight });
			}
		}
	});

	if (patterns.size === 0) return null;

	return (
		<svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}>
			<defs>
				{Array.from(patterns.values()).map(({ id, type, color, opacity, spacing, weight }) => (
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
							// Staggered Dot Pattern
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
