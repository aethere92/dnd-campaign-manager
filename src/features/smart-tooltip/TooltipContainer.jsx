import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TooltipCard } from './components/TooltipCard';

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
				const { data } = await supabase
					.from('sessions')
					.select('title, session_number, session_date, summary')
					.eq('id', targetId)
					.single();
				return {
					name: data.title,
					type: 'session',
					description: data.summary,
					attributes: { Session: data.session_number, Date: data.session_date },
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
	const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

	return createPortal(
		<>
			{/* Mobile backdrop - tap outside to close */}
			{isMobile && target.isPinned && (
				<div
					className='fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]'
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
