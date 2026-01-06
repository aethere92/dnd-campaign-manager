import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { getTooltipData } from '@/domain/entity/api/entityService';
import { TooltipCard } from './components/TooltipCard';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

export const TooltipContainer = ({ target, onMouseEnter, onMouseLeave }) => {
	const targetId = target?.id;
	const targetType = target?.type;
	// We need a ref to the card to know if a click was "inside" or "outside"
	const cardRef = useRef(null);

	const isValidId = targetId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId) : false;

	const { data, isLoading } = useQuery({
		queryKey: ['tooltip', targetId],
		queryFn: async () => {
			if (!targetId) return null;
			const rawData = await getTooltipData(targetId, targetType);

			if (targetType === 'session') {
				const attrs = rawData.attributes || {};
				const synopsis = getAttributeValue(attrs, 'synopsis');

				if (!rawData.description) {
					return {
						...rawData,
						description: synopsis || rawData.narrative || 'No synopsis available.',
					};
				}
			}
			return rawData;
		},
		enabled: !!targetId && isValidId,
		staleTime: 1000 * 60 * 5,
		retry: false,
	});

	// HANDLE OUTSIDE INTERACTIONS (The "No-Backdrop" Solution)
	useEffect(() => {
		if (!target) return;

		// 1. Close on Scroll (User drags screen)
		const handleScroll = () => {
			if (onMouseLeave) onMouseLeave();
		};

		// 2. Close on Outside Tap (User taps background)
		const handleOutsideTap = (e) => {
			// If the tap is NOT inside the card, close it
			if (cardRef.current && !cardRef.current.contains(e.target)) {
				if (onMouseLeave) onMouseLeave();
			}
		};

		// Passive listener for scroll performance
		window.addEventListener('scroll', handleScroll, { passive: true });
		// Capture phase ensures we catch the tap before it triggers other buttons
		document.addEventListener('touchstart', handleOutsideTap, { passive: false });
		document.addEventListener('mousedown', handleOutsideTap);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			document.removeEventListener('touchstart', handleOutsideTap);
			document.removeEventListener('mousedown', handleOutsideTap);
		};
	}, [target, onMouseLeave]);

	if (!target) return null;

	return createPortal(
		// Wrap with a simple div to attach the Ref for "contains" checking
		<div ref={cardRef} style={{ display: 'contents' }}>
			<TooltipCard
				data={data}
				type={target.type}
				id={target.id}
				position={target.pos}
				isLoading={isLoading}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			/>
		</div>,
		document.body
	);
};
