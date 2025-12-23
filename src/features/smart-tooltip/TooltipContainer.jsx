import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { getTooltipData } from '../../services/entities'; // Use Service
import { TooltipCard } from './components/TooltipCard';
import { getAttributeValue } from '../../utils/entity/attributeParser';

export const TooltipContainer = ({ target, onMouseEnter, onMouseLeave }) => {
	const targetId = target?.id;
	const targetType = target?.type;
	const isValidId = targetId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId) : false;

	const { data, isLoading } = useQuery({
		queryKey: ['tooltip', targetId],
		// Call Service instead of Supabase directly
		queryFn: async () => {
			if (!targetId) return null;
			const rawData = await getTooltipData(targetId, targetType);

			// Small amount of VIEW logic remains here to shape it for the Card
			if (targetType === 'session') {
				const attrs = (rawData.attributes || []).reduce((acc, c) => ({ ...acc, [c.name]: c.value }), {});
				const num = getAttributeValue(attrs, ['session_number', 'Session']);
				const date = getAttributeValue(attrs, ['session_date', 'Date']);
				const summaryAttr = getAttributeValue(attrs, 'Summary');

				return {
					name: rawData.name,
					type: 'session',
					description: summaryAttr || rawData.description,
					attributes: { Session: num, Date: date },
				};
			}
			return rawData;
		},
		enabled: !!targetId && isValidId,
		staleTime: 1000 * 60 * 5,
		retry: false,
	});

	if (!target) return null;
	const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;

	return createPortal(
		<>
			{isMobile && target.isPinned && (
				<div
					className='fixed inset-0 bg-black/20 z-[9998]'
					onClick={(e) => {
						e.stopPropagation();
						onMouseLeave && onMouseLeave();
					}}
					style={{ touchAction: 'none' }}
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
