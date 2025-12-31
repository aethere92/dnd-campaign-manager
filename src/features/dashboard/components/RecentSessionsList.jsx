import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const RecentSessionsList = ({ sessions }) => {
	return (
		<div>
			<h2 className='text-xl font-serif font-bold text-foreground mb-4'>Recent Sessions</h2>
			<div className='space-y-3'>
				{sessions.map((session) => (
					<Link
						key={session.id}
						to={`/wiki/session/${session.id}`}
						className='block bg-background border border-border rounded-lg p-4 hover:border-accent/30 hover:shadow-md transition-all group'>
						<div className='flex items-start justify-between gap-4'>
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2 mb-1'>
									<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border'>
										Session {session.session_number - 1}
									</span>
									{session.session_date && (
										<span className='text-xs text-muted-foreground flex items-center gap-1'>
											<Calendar size={10} />
											{session.session_date}
										</span>
									)}
								</div>
								<h3 className='text-base font-serif font-bold text-foreground mb-1 group-hover:text-accent transition-colors'>
									{session.name}
								</h3>
								{session.description && (
									<p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>{session.description}</p>
								)}
								{session.events && session.events.length > 0 && (
									<div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
										<span>{session.events.length} events</span>
										{session.mentions && (
											<>
												<span>•</span>
												<span>
													{Object.values(session.mentions).reduce((sum, arr) => sum + arr.length, 0)} entities
												</span>
											</>
										)}
									</div>
								)}
							</div>
							<ArrowRight
								size={18}
								className='shrink-0 text-muted-foreground/70 group-hover:text-accent group-hover:translate-x-1 transition-all'
							/>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};
