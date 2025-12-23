import { CheckCircle2, Circle, XCircle, Target } from 'lucide-react';
import { clsx } from 'clsx';

export const QuestObjectives = ({ objectives }) => {
	if (!objectives || objectives.length === 0) return null;

	return (
		<div className='mb-8 not-prose border border-stone-200 rounded-lg overflow-hidden bg-background'>
			<div className='px-3 py-2 border-b border-stone-200 bg-stone-100/40 flex items-center gap-2'>
				<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 m-0'>
					<Target size={12} className='text-accent' /> Quest Objectives
				</h3>
			</div>
			<div className='divide-y divide-border/50'>
				{objectives.map((obj, idx) => {
					const isCompleted = obj.status === 'completed';
					const isFailed = obj.status === 'failed';
					return (
						<div
							key={obj.id || idx}
							className={clsx(
								'flex items-start gap-3 px-3 py-2.5 transition-colors',
								isCompleted ? 'bg-emerald-50/30' : isFailed ? 'bg-red-50/30' : 'hover:bg-muted/50'
							)}>
							<div className='mt-0.5 shrink-0'>
								{isCompleted ? (
									<CheckCircle2 size={14} className='text-emerald-600' />
								) : isFailed ? (
									<XCircle size={14} className='text-red-500' />
								) : (
									<Circle size={14} className='text-muted-foreground/40' strokeWidth={2} />
								)}
							</div>
							<div className='flex-1 min-w-0'>
								<p
									className={clsx(
										'text-[13px] leading-snug m-0',
										isCompleted ? 'text-muted-foreground' : isFailed ? 'text-red-800/80' : 'text-foreground font-medium'
									)}>
									{obj.description}
								</p>
								{obj.objective_name && (
									<span className='block text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider mt-1'>
										{obj.objective_name}
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
