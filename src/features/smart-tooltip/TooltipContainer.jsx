import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TooltipCard } from './components/TooltipCard';

export const TooltipContainer = ({ target, onMouseEnter, onMouseLeave }) => {
	// 1. PREPARE VARIABLES (Don't return yet!)
	const targetId = target?.id;
	const targetType = target?.type;
	const isValidId = targetId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId) : false;

	// 2. CALL HOOK UNCONDITIONALLY
	const { data, isLoading } = useQuery({
		queryKey: ['tooltip', targetId], // Use variable, handles undefined safely
		queryFn: async () => {
			if (!targetId) return null; // Safety check inside function

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
		// Control execution with 'enabled' instead of conditional return
		enabled: !!targetId && isValidId,
		staleTime: 1000 * 60 * 5,
		retry: false,
	});

	// 3. NOW it is safe to return null if no target exists
	if (!target) return null;

	return createPortal(
		<TooltipCard
			data={data}
			type={target.type}
			id={target.id}
			position={target.pos}
			isLoading={isLoading}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		/>,
		document.body
	);
};
