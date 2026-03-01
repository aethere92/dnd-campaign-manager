import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

const PRIORITY_COLORS = {
	critical: 'text-red-500',
	high: 'text-orange-500',
	medium: 'text-amber-500',
};

export const UnresolvedThreads = ({ threads }) => {
	const navigate = useNavigate();

	if (!threads || threads.length === 0) {
		return (
			<div className='h-full flex flex-col items-center justify-center text-muted-foreground py-12 bg-card/30 border border-border rounded-xl'>
				<BookOpen size={24} className='mb-2 opacity-20' />
				<p className='text-sm italic'>No active mysteries recorded.</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col h-full'>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2'>
				<BookOpen size={12} /> Unresolved Threads
			</h4>

			<div className='flex flex-col gap-3'>
				{threads.slice(0, 5).map((thread) => {
					const priority = (thread.attributes?.priority || 'normal').toLowerCase();
					const prioColor = PRIORITY_COLORS[priority] || 'text-muted-foreground';
					
					// Find the latest active narrative hook
					const activeObj = thread.objectives?.find(o => o.status === 'active');
					const narrativeText = activeObj?.objective_update || activeObj?.description || thread.description;

					return (
						<div
							key={thread.id}
							onClick={(e) => {
								if (e.target.closest('a')) return;
								navigate(`/wiki/quest/${thread.id}`);
							}}
							className='group relative bg-card border border-border rounded-lg p-4 hover:shadow-sm hover:border-primary/40 transition-all cursor-pointer'>
							
							<div className='flex items-start justify-between gap-4 mb-2'>
								<h3 className='font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight text-base'>
									<SmartMarkdown>{thread.title || thread.name}</SmartMarkdown>
								</h3>
								{priority !== 'normal' && priority !== 'low' && (
									<div className={clsx('flex items-center gap-1 shrink-0', prioColor)}>
										<AlertCircle size={10} />
										<span className='text-[9px] uppercase font-bold tracking-wider'>{priority}</span>
									</div>
								)}
							</div>

							{narrativeText && (
								<div className='text-xs text-muted-foreground line-clamp-2 leading-relaxed border-l-2 border-border pl-3 mt-2 group-hover:border-primary/30 transition-colors'>
									<SmartMarkdown components={{ p: 'span' }}>{narrativeText}</SmartMarkdown>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};