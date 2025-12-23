import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TooltipCard } from './components/TooltipCard';
import { getAttributeValue } from '../../utils/entity/attributeParser';

export const TooltipContainer = ({ target, onMouseEnter, onMouseLeave }) => {
	// 1. PREPARE VARIABLES
	const targetId = target?.id;
	const targetType = target?.type;
	const isValidId = targetId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId) : false;

	// 2. CALL HOOK UNCONDITIONALLY
	const { data, isLoading } = useQuery({
		queryKey: ['tooltip', targetId],
		queryFn: async () => {
			if (!targetId) return null;

			if (targetType === 'session') {
				// 1. Session data (No summary)
				const { data } = await supabase.from('sessions').select('title, narrative').eq('id', targetId).single();

				// 2. Attributes data
				const { data: attributes } = await supabase.from('attributes').select('name, value').eq('entity_id', targetId);

				const attrs = (attributes || []).reduce((acc, c) => ({ ...acc, [c.name]: c.value }), {});
				const num = getAttributeValue(attrs, ['session_number', 'Session']);
				const date = getAttributeValue(attrs, ['session_date', 'Date']);
				const summaryAttr = getAttributeValue(attrs, 'Summary');

				return {
					name: data.title,
					type: 'session',
					description: summaryAttr || data.narrative,
					attributes: { Session: num, Date: date },
				};
			}

			const { data, error } = await supabase
				.from('entity_complete_view')
				.select('name, type, description, attributes')
				.eq('id', targetId)
				.single();
			if (error) throw error;
			return data;
		},
		enabled: !!targetId && isValidId,
		staleTime: 1000 * 60 * 5,
		retry: false,
	});

	// 3. Return null if no target
	if (!target) return null;

	// Detect if this is a mobile/touch device
	// FIX: Synced breakpoint with EntityLink (1024px) to ensure consistent behavior on tablets
	const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;

	return createPortal(
		<>
			{/* Mobile backdrop - tap outside to close */}
			{isMobile && target.isPinned && (
				<div
					// CHANGED: Removed backdrop-blur-sm, kept dimming
					className='fixed inset-0 bg-black/20 z-[9998]'
					onClick={(e) => {
						e.stopPropagation();
						onMouseLeave && onMouseLeave();
					}}
					style={{ touchAction: 'none' }} // Prevent scroll
				/>
			)}

			<TooltipCard
				data={data}
				type={target.type}
				id={target.id}
				position={target.pos}
				isLoading={isLoading}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			/>
		</>,
		document.body
	);
};
