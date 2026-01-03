import { useNavigate } from 'react-router-dom';
import { Scroll } from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const ActiveThreads = ({ quests }) => {
	const navigate = useNavigate();
	// Show more quests now that we have height
	const displayQuests = quests?.slice(0, 12) || [];

	const handleRowClick = (id, e) => {
		// If the user clicked a link inside SmartMarkdown, don't trigger the row click
		if (e.target.tagName === 'A' || e.target.closest('a')) {
			return;
		}
		navigate(`/wiki/quest/${id}`);
	};

	return (
		<div className='h-full flex flex-col'>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 shrink-0'>
				Active Threads
			</h4>

			<div className='space-y-3 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2'>
				{displayQuests.map((quest) => {
					const priority = (quest.attributes?.priority || 'normal').toLowerCase();
					const isMain = (quest.attributes?.type || '').toLowerCase() === 'main quest';

					let prioColor = 'text-muted-foreground/50';
					if (priority === 'critical') prioColor = 'text-red-500';
					else if (priority === 'high') prioColor = 'text-orange-500';
					else if (isMain) prioColor = 'text-amber-500';

					return (
						<div
							key={quest.id}
							onClick={(e) => handleRowClick(quest.id, e)}
							className='block group py-1 cursor-pointer relative'>
							<div className='flex gap-1 min-w-0 justify-between'>
								<div
									className={clsx(
										'text-sm font-serif font-medium leading-snug group-hover:text-primary transition-colors line-clamp-1 truncate',
										isMain ? 'text-foreground font-bold' : 'text-foreground/80'
									)}>
									{/* Now safe to use because parent is a div, not an <a> */}
									<SmartMarkdown>{quest.title || quest.name}</SmartMarkdown>
								</div>

								<div className='flex items-center justify-between'>
									<span />
									{priority !== 'normal' && priority !== 'low' && (
										<span className={clsx('text-[9px] uppercase font-bold tracking-wider', prioColor)}>{priority}</span>
									)}
								</div>
							</div>
						</div>
					);
				})}

				{quests?.length === 0 && (
					<div className='text-center py-6 text-muted-foreground'>
						<Scroll size={24} className='mx-auto mb-2 opacity-20' />
						<p className='text-xs italic'>No active threads recorded.</p>
					</div>
				)}
			</div>
		</div>
	);
};
