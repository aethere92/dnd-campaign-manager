import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { getTooltipData } from '@/domain/entity/api/entityService';
import { TooltipCard } from './components/TooltipCard';

export const TooltipContainer = ({ target, onMouseEnter, onMouseLeave }) => {
	const targetId = target?.id;
	const targetType = target?.type;
	const isValidId = targetId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId) : false;

	const { data, isLoading } = useQuery({
		queryKey: ['tooltip', targetId],
		queryFn: async () => {
			if (!targetId) return null;
			const rawData = await getTooltipData(targetId, targetType);

			// FIX: If it's a session, ensure the 'narrative' is used as description
			// because the entities table often has null description for sessions.
			if (targetType === 'session' && !rawData.description && rawData.narrative) {
				return { ...rawData, description: rawData.narrative };
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
			{/* Mobile Backdrop to close tooltip on tap outside */}
			{isMobile && (
				<div
					className='fixed inset-0 z-[9998]'
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
