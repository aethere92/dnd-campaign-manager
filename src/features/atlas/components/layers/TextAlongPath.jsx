import { useEffect, useId, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';

export const TextAlongPath = ({ layerRef, text, style = {}, visible = true }) => {
	const map = useMap();
	// Strip colons for valid selector IDs
	const uniqueId = useId().replace(/:/g, '');
	const domId = `path-link-${uniqueId}`;

	const textNodeRef = useRef(null);
	const guidePathRef = useRef(null);

	const updateGeometry = useCallback(() => {
		const layer = layerRef.current;
		if (!layer || !text) return;

		const pathElement = layer._path;
		if (!pathElement) return;

		const svgContainer = pathElement.parentNode;
		if (!svgContainer) return;

		// 1. Analyze Geometry & Direction
		const rings = layer._parts;
		if (!rings || rings.length === 0) return;
		const points = rings[0];
		if (!points || points.length < 2) return;

		// If line goes Right-to-Left (East to West), reverse it so text isn't upside down
		const isBackwards = points[points.length - 1].x < points[0].x;

		let d = '';
		if (isBackwards) {
			for (let i = points.length - 1; i >= 0; i--) {
				d += (i === points.length - 1 ? 'M' : 'L') + points[i].x + ',' + points[i].y + ' ';
			}
		} else {
			for (let i = 0; i < points.length; i++) {
				d += (i === 0 ? 'M' : 'L') + points[i].x + ',' + points[i].y + ' ';
			}
		}

		// 2. Create/Update Hidden Guide Path
		let guide = guidePathRef.current;
		if (!guide) {
			guide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			guide.setAttribute('id', `guide-${domId}`);
			guide.setAttribute('fill', 'none');
			guide.setAttribute('stroke', 'none');
			svgContainer.insertBefore(guide, pathElement);
			guidePathRef.current = guide;
		}
		guide.setAttribute('d', d);

		// 3. Sparse Calculation Logic
		const pathLength = guide.getTotalLength();

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const fontSize = style.fontSize || 12;
		const fontWeight = style.fontWeight || 800;
		ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
		const textWidth = ctx.measureText(text).width;

		// --- SPARSITY TUNING ---
		// A segment is the space allocated to ONE label.
		// We set this very high to prevent clutter.
		// 1200px (roughly a screen width) OR 10x the text width, whichever is bigger.
		const minSegmentLength = Math.max(1200, textWidth * 10);

		// How many segments fit?
		let labelCount = Math.floor(pathLength / minSegmentLength);

		// Always show at least 1, but cap at 4 to prevent spam on massive zoom-ins
		labelCount = Math.max(1, Math.min(labelCount, 4));

		// Distribution:
		// 1 -> 50%
		// 2 -> 33%, 66%
		// 3 -> 25%, 50%, 75%
		const offsets = [];
		const interval = 100 / (labelCount + 1);
		for (let i = 1; i <= labelCount; i++) {
			offsets.push(`${interval * i}%`);
		}

		// 4. Create/Update Text Wrapper
		let textNode = textNodeRef.current;
		if (!textNode) {
			const NS = 'http://www.w3.org/2000/svg';
			textNode = document.createElementNS(NS, 'text');
			textNode.setAttribute('id', `text-${domId}`);
			textNode.setAttribute('dominant-baseline', 'middle');
			svgContainer.appendChild(textNode);
			textNodeRef.current = textNode;
		}

		// 5. Apply Styles
		Object.assign(textNode.style, {
			pointerEvents: 'none',
			fontFamily: 'var(--font-sans, sans-serif)',
			fontWeight: `${fontWeight}`,
			fontSize: `${fontSize}px`,
			fill: style.color || '#ffffff',
			stroke: style.strokeColor || '#000000',
			strokeWidth: '5px',
			paintOrder: 'stroke',
			strokeLinejoin: 'round',
			strokeLinecap: 'round',
			textRendering: 'geometricPrecision',
			letterSpacing: '0.05em',
			whiteSpace: 'pre',
			transition: 'opacity 0.2s ease-in-out',
			opacity: visible ? style.opacity || 1 : 0,
		});

		// 6. Generate <textPath> elements
		const NS = 'http://www.w3.org/2000/svg';

		// Clear existing children
		while (textNode.firstChild) {
			textNode.removeChild(textNode.firstChild);
		}

		offsets.forEach((offset) => {
			const textPath = document.createElementNS(NS, 'textPath');
			textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#guide-${domId}`);

			textPath.setAttribute('startOffset', offset);
			textPath.setAttribute('text-anchor', 'middle');
			textPath.setAttribute('alignment-baseline', 'middle');

			textPath.textContent = text;
			textNode.appendChild(textPath);
		});
	}, [layerRef, text, domId, style, visible]);

	// --- Lifecycle ---

	useEffect(() => {
		requestAnimationFrame(updateGeometry);
		const onMapUpdate = () => requestAnimationFrame(updateGeometry);

		map.on('zoomend', onMapUpdate);
		map.on('moveend', onMapUpdate);

		return () => {
			map.off('zoomend', onMapUpdate);
			map.off('moveend', onMapUpdate);
		};
	}, [map, updateGeometry]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (textNodeRef.current) textNodeRef.current.remove();
			if (guidePathRef.current) guidePathRef.current.remove();
		};
	}, []);

	return null;
};
