import { Link } from 'react-router-dom';
import { Scroll, CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';

export const ActiveQuestsWidget = ({ quests }) => {
	return (
		<div className='bg-background border border-border rounded-lg shadow-sm overflow-hidden'>
			<div className='px-4 py-3 bg-muted border-b border-border flex items-center justify-between'>
				<h3 className='text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
					<Scroll size={14} className='text-blue-600' />
					Active Quests
				</h3>
				<span className='text-xs font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border'>
					{quests.length}
				</span>
			</div>
			<div className='divide-y divide-border'>
				{quests.map((quest) => {
					const progress = quest.objectives
						? {
								completed: quest.objectives.filter((o) => o.status === 'completed').length,
								total: quest.objectives.length,
						  }
						: null;

					return (
						<Link
							key={quest.id}
							to={`/wiki/quest/${quest.id}`}
							className='block px-4 py-3 hover:bg-muted/50 transition-colors group'>
							<div className='flex items-start gap-3'>
								<Circle size={16} className='text-blue-500 shrink-0 mt-0.5' strokeWidth={2.5} />
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1'>
										{quest.name}
									</p>
									{progress && (
										<div className='flex items-center gap-2'>
											<div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border'>
												<div
													className='h-full bg-blue-500 transition-all'
													style={{ width: `${(progress.completed / progress.total) * 100}%` }}
												/>
											</div>
											<span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
												{progress.completed}/{progress.total}
											</span>
										</div>
									)}
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
};
