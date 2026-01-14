// --- FILE: features/atlas/components/layers/TextAlongPath.jsx ---
import { useEffect, useId, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';

export const TextAlongPath = ({ layerRef, text, style = {}, visible = true }) => {
	const map = useMap();
	// Strip colons for valid CSS selectors
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

		// 1. Geometry & Direction
		const rings = layer._parts;
		if (!rings || rings.length === 0) return;
		const points = rings[0];
		if (!points || points.length < 2) return;

		// Check if line goes Right-to-Left (East to West)
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

		// 2. Guide Path (Hidden)
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

		// 3. Spacing Logic
		const pathLength = guide.getTotalLength();

		// Canvas measure for accuracy
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const fontSize = style.fontSize || 12;
		const fontWeight = style.fontWeight || 800;
		ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
		const textWidth = ctx.measureText(text).width;

		// CONFIG: Only repeat if we have LOTS of room.
		// Use 600px OR 5x the text width, whichever is larger.
		const minGap = Math.max(600, textWidth * 5);

		// Use EM Quads (\u2001) or Em Spaces (\u2003) for reliable wide gaps
		// This creates a gap that scales with font-size
		const spacer = '\u2003\u2003\u2003\u2003\u2003   •   \u2003\u2003\u2003\u2003\u2003';
		const spacerWidth = 200; // Approximate visual width of the spacer string above

		let finalContent = text;

		// Only repeat if the path can fit: Text + Gap + Text
		if (pathLength > textWidth * 2 + spacerWidth) {
			// Calculate max fit
			const segmentSize = textWidth + minGap;
			const count = Math.floor(pathLength / segmentSize);

			// Cap at reasonable number to prevent lag/spam
			const safeCount = Math.min(count, 5);

			if (safeCount > 1) {
				finalContent = new Array(safeCount).fill(text).join(spacer);
			}
		}

		// 4. Create/Update Text Node
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
			textShadow: 'none',
			textRendering: 'geometricPrecision',
			letterSpacing: '0.05em',
			whiteSpace: 'pre', // <--- CRITICAL: Respects the spaces/gaps we added
			transition: 'opacity 0.2s ease-in-out',
			opacity: visible ? style.opacity || 1 : 0,
		});

		// 6. Update Content
		const NS = 'http://www.w3.org/2000/svg';
		// Clear children safely
		while (textNode.firstChild) {
			textNode.removeChild(textNode.firstChild);
		}

		const textPath = document.createElementNS(NS, 'textPath');
		textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#guide-${domId}`);
		textPath.setAttribute('startOffset', '50%');
		textPath.setAttribute('text-anchor', 'middle');
		// alignment-baseline helps vertical centering on some browsers
		textPath.setAttribute('alignment-baseline', 'middle');
		textPath.textContent = finalContent;

		textNode.appendChild(textPath);
	}, [layerRef, text, domId, style, visible]);

	// --- Lifecycle ---

	useEffect(() => {
		requestAnimationFrame(updateGeometry);

		const onMapUpdate = () => requestAnimationFrame(updateGeometry);

		// Leaflet events
		map.on('zoomend', onMapUpdate);
		map.on('moveend', onMapUpdate);

		return () => {
			map.off('zoomend', onMapUpdate);
			map.off('moveend', onMapUpdate);
		};
	}, [map, updateGeometry]);

	// Strict Cleanup
	useEffect(() => {
		return () => {
			if (textNodeRef.current) textNodeRef.current.remove();
			if (guidePathRef.current) guidePathRef.current.remove();
		};
	}, []);

	return null;
};
